import csv
import io
import os
import re
import unicodedata
import zipfile
from datetime import date, datetime
from functools import lru_cache
from pathlib import Path
from typing import Any
from urllib.parse import urljoin

import requests


IBGE_BASE_URL = "https://servicodados.ibge.gov.br/api/v1/localidades"
NFS_E_ALIQUOTAS_PAGE = os.getenv(
    "NFSE_ALIQUOTAS_PAGE",
    "https://www.gov.br/nfse/pt-br/biblioteca/aliquotas",
)
REQUEST_TIMEOUT = float(os.getenv("API_HTTP_TIMEOUT", "20"))
CACHE_DIR = Path(
    os.getenv(
        "ISS_CACHE_DIR",
        str(Path.cwd() / "instance" / "iss_cache"),
    )
)
CACHE_DIR.mkdir(parents=True, exist_ok=True)

CODIGO_COMPLETO_RE = re.compile(r"(?<!\d)(\d{2}\.\d{2}\.\d{2}\.\d{3})(?!\d)")
CODIGO_NACIONAL_RE = re.compile(r"(?<!\d)(\d{2}\.\d{2}\.\d{2})(?!\.\d{3})(?!\d)")


class APIExternaErro(RuntimeError):
    """Erro controlado ao acessar ou interpretar uma fonte externa."""


# Compatibilidade com versões anteriores do projeto.
ErroConsultaISS = APIExternaErro


def _normalizar_texto(valor: Any) -> str:
    texto = "" if valor is None else str(valor)
    texto = unicodedata.normalize("NFKD", texto)
    texto = "".join(c for c in texto if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]", "", texto.lower())


def _somente_digitos(valor: Any) -> str:
    return re.sub(r"\D", "", "" if valor is None else str(valor))


def _formatar_codigo_nacional(digitos: str) -> str:
    digitos = _somente_digitos(digitos)
    if len(digitos) < 6:
        return ""
    digitos = digitos[:6]
    return f"{digitos[0:2]}.{digitos[2:4]}.{digitos[4:6]}"


def _formatar_codigo_completo(digitos: str) -> str:
    digitos = _somente_digitos(digitos)
    if len(digitos) < 9:
        return ""
    digitos = digitos[:9]
    return (
        f"{digitos[0:2]}.{digitos[2:4]}."
        f"{digitos[4:6]}.{digitos[6:9]}"
    )


def _codigo_servico_nacional(valor: Any) -> str:
    """
    Normaliza o código nacional da NFS-e para 6 dígitos.

    01.01.01.000 -> 010101
    01.01.01     -> 010101
    """
    texto = "" if valor is None else str(valor).strip()

    completo = CODIGO_COMPLETO_RE.search(texto)
    if completo:
        return _somente_digitos(completo.group(1))[:6]

    nacional = CODIGO_NACIONAL_RE.search(texto)
    if nacional:
        return _somente_digitos(nacional.group(1))[:6]

    digitos = _somente_digitos(texto)
    if len(digitos) >= 6:
        return digitos[:6]

    return ""


def _codigo_servico_completo(valor: Any) -> str:
    """Retorna o código completo (6 dígitos nacionais + 3 municipais)."""
    texto = "" if valor is None else str(valor).strip()

    encontrado = CODIGO_COMPLETO_RE.search(texto)
    if encontrado:
        return _formatar_codigo_completo(encontrado.group(1))

    digitos = _somente_digitos(texto)
    if len(digitos) >= 9:
        return _formatar_codigo_completo(digitos[:9])

    return ""


def _normalizar_competencia(valor: str | None) -> date:
    if not valor:
        hoje = date.today()
        return date(hoje.year, hoje.month, 1)

    texto = valor.strip()
    for formato in ("%Y-%m-%d", "%Y-%m", "%d/%m/%Y", "%m/%Y"):
        try:
            data = datetime.strptime(texto, formato)
            return date(data.year, data.month, 1)
        except ValueError:
            pass

    raise ValueError("Competência inválida. Use YYYY-MM ou YYYY-MM-DD.")


def _formatar_competencia(valor: date) -> str:
    return valor.strftime("%Y-%m-01")


def _parse_data(valor: Any) -> date | None:
    texto = "" if valor is None else str(valor).strip()
    if not texto:
        return None

    for formato in (
        "%Y-%m-%d",
        "%Y/%m/%d",
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%m/%Y",
        "%Y-%m",
        "%Y%m%d",
    ):
        try:
            data = datetime.strptime(texto[:10], formato)
            return date(data.year, data.month, data.day if "%d" in formato else 1)
        except ValueError:
            pass

    return None


def _normalizar_aliquota(valor: Any) -> float | None:
    if valor is None:
        return None

    texto = str(valor).strip().replace("%", "").replace(" ", "")
    if not texto:
        return None

    if "," in texto:
        texto = texto.replace(".", "").replace(",", ".")

    try:
        numero = float(texto)
    except ValueError:
        return None

    if numero < 0 or numero > 100:
        return None

    return round(numero, 4)


def listar_municipios_uf(uf: str) -> list[dict[str, Any]]:
    uf = (uf or "").strip().upper()
    if len(uf) != 2 or not uf.isalpha():
        raise ValueError("UF inválida.")

    url = f"{IBGE_BASE_URL}/estados/{uf}/municipios"

    try:
        resposta = requests.get(
            url,
            timeout=REQUEST_TIMEOUT,
            headers={"Accept": "application/json", "User-Agent": "SpacoContabil-RPA/2026"},
        )
        resposta.raise_for_status()
        dados = resposta.json()
    except (requests.RequestException, ValueError) as exc:
        raise APIExternaErro("Não foi possível consultar os municípios no IBGE.") from exc

    municipios = [
        {"id": int(item["id"]), "nome": item["nome"]}
        for item in dados
        if item.get("id") and item.get("nome")
    ]
    municipios.sort(key=lambda item: item["nome"])
    return municipios


def _descobrir_url_zip() -> str:
    try:
        resposta = requests.get(
            NFS_E_ALIQUOTAS_PAGE,
            timeout=REQUEST_TIMEOUT,
            headers={"Accept": "text/html", "User-Agent": "SpacoContabil-RPA/2026"},
        )
        resposta.raise_for_status()
    except requests.RequestException as exc:
        raise APIExternaErro("Não foi possível acessar a página pública de alíquotas da NFS-e.") from exc

    html = resposta.text
    padroes = (
        r'href=["\']([^"\']*aliquotas-municipios-[^"\']+\.zip)["\']',
        r'href=["\']([^"\']+\.zip)["\']',
    )

    for padrao in padroes:
        encontrado = re.search(padrao, html, flags=re.IGNORECASE)
        if encontrado:
            return urljoin(NFS_E_ALIQUOTAS_PAGE, encontrado.group(1))

    raise APIExternaErro("O Portal NFS-e não informou o arquivo público de alíquotas esperado.")


def _arquivo_zip_cache() -> Path:
    existentes = sorted(
        CACHE_DIR.glob("aliquotas-municipios-*.zip"),
        key=lambda arquivo: arquivo.stat().st_mtime,
        reverse=True,
    )

    try:
        url = _descobrir_url_zip()
        nome = Path(url.split("?", 1)[0]).name
        destino = CACHE_DIR / nome

        if destino.exists() and zipfile.is_zipfile(destino):
            return destino

        resposta = requests.get(
            url,
            timeout=max(REQUEST_TIMEOUT, 60),
            headers={
                "Accept": "application/zip, application/octet-stream, */*",
                "User-Agent": "SpacoContabil-RPA/2026",
            },
        )
        resposta.raise_for_status()

        temporario = destino.with_suffix(".tmp")
        temporario.write_bytes(resposta.content)

        if not zipfile.is_zipfile(temporario):
            temporario.unlink(missing_ok=True)
            raise APIExternaErro("O arquivo baixado da NFS-e não é um ZIP válido.")

        temporario.replace(destino)
        return destino

    except (requests.RequestException, APIExternaErro) as exc:
        if existentes and zipfile.is_zipfile(existentes[0]):
            return existentes[0]

        if isinstance(exc, APIExternaErro):
            raise

        raise APIExternaErro("Não foi possível baixar a base pública de alíquotas da NFS-e.") from exc


def _decodificar_csv(conteudo: bytes) -> str:
    for encoding in ("utf-8-sig", "utf-8", "latin-1"):
        try:
            return conteudo.decode(encoding)
        except UnicodeDecodeError:
            pass

    raise APIExternaErro("Não foi possível decodificar o CSV de alíquotas.")


def _detectar_delimitador(texto: str) -> str:
    amostra = "\n".join(texto.splitlines()[:10])
    try:
        return csv.Sniffer().sniff(amostra, delimiters=";|,\t").delimiter
    except csv.Error:
        return ";"


def _mapear_cabecalho(fieldnames: list[str]) -> dict[str, str | None]:
    normalizados = {
        _normalizar_texto(nome): nome
        for nome in fieldnames
        if nome
    }

    def achar(*candidatos: str) -> str | None:
        for candidato in candidatos:
            alvo = _normalizar_texto(candidato)
            if alvo in normalizados:
                return normalizados[alvo]

        for chave, original in normalizados.items():
            for candidato in candidatos:
                alvo = _normalizar_texto(candidato)
                if alvo and alvo in chave:
                    return original
        return None

    return {
        "municipio": achar(
            "Município", "Código Município", "Código IBGE", "CodigoMunicipio",
            "CodigoIBGE", "IBGE", "CodMunicipio"
        ),
        "codigo_completo": achar(
            "Código Completo", "CodigoCompleto", "Código do Serviço", "CodigoServico",
            "Código Tributação", "CodigoTributacao", "cTrib", "cTribMun"
        ),
        "iss_nacional": achar(
            "Código Nacional ISS", "CodigoNacionalISS", "CodigoServicoNacional",
            "Código Tributação Nacional", "CodigoTributacaoNacional", "cTribNac"
        ),
        "iss_municipal": achar(
            "ISS do Município", "CodigoISSMunicipio", "CodigoTributacaoMunicipal",
            "Código Tributação Municipal", "CodigoOriginalServico", "Código Original"
        ),
        "descricao": achar(
            "Descrição do ISS do Município", "DescricaoISSMunicipio", "DescricaoServico",
            "Descrição do Serviço", "Descricao", "xTribNac", "xTribMun"
        ),
        "aliquota": achar(
            "Alíquota", "Aliquota", "AliquotaISS", "AliquotaISSQN", "pAliq"
        ),
        "vigencia": achar(
            "Vigência", "Vigencia", "DataVigencia", "InicioVigencia", "Data Inicial"
        ),
    }


def _extrair_codigo_de_valores(linha: dict[str, Any]) -> str:
    """Procura um código completo em qualquer célula da linha."""
    for valor in linha.values():
        texto = "" if valor is None else str(valor)
        codigo = _codigo_servico_completo(texto)
        if codigo:
            return codigo
    return ""


def _extrair_payload_pipe(linha: dict[str, Any]) -> dict[str, Any] | None:
    """
    O padrão NFS-e também usa registros de serviço em uma única célula,
    separados por pipe. Exemplo oficial:

    07.02.01.002|Descrição||457|2,54|1|2|1

    Campos úteis para esta calculadora:
      0 = código completo
      1 = descrição
      2 = código original municipal
      3 = identificador da legislação
      4 = alíquota
    """
    for valor in linha.values():
        texto = "" if valor is None else str(valor).strip()
        if "|" not in texto:
            continue

        partes = [parte.strip() for parte in texto.split("|")]
        if not partes:
            continue

        codigo = _codigo_servico_completo(partes[0])
        if not codigo:
            continue

        return {
            "codigo_completo": codigo,
            "descricao": partes[1] if len(partes) > 1 else "",
            "iss_municipal": partes[2] if len(partes) > 2 else "",
            "aliquota": _normalizar_aliquota(partes[4]) if len(partes) > 4 else None,
        }

    return None


def _obter_valor(linha: dict[str, Any], campo: str | None) -> str:
    if not campo:
        return ""
    return str(linha.get(campo, "") or "").strip()


@lru_cache(maxsize=1)
def _carregar_registros():
    zip_path = _arquivo_zip_cache()
    registros: list[dict[str, Any]] = []

    try:
        with zipfile.ZipFile(zip_path) as arquivo_zip:
            arquivos_csv = [
                nome
                for nome in arquivo_zip.namelist()
                if nome.lower().endswith(".csv") and not nome.endswith("/")
            ]

            if not arquivos_csv:
                raise APIExternaErro("O pacote oficial da NFS-e não contém CSVs.")

            for nome in arquivos_csv:
                texto = _decodificar_csv(arquivo_zip.read(nome))
                delimitador = _detectar_delimitador(texto)
                leitor = csv.DictReader(io.StringIO(texto), delimiter=delimitador)

                if not leitor.fieldnames:
                    continue

                mapa = _mapear_cabecalho(leitor.fieldnames)
                if not mapa["municipio"]:
                    continue

                for linha in leitor:
                    codigo_municipio = _somente_digitos(
                        _obter_valor(linha, mapa["municipio"])
                    )
                    if len(codigo_municipio) != 7:
                        continue

                    payload = _extrair_payload_pipe(linha)

                    codigo_completo = _codigo_servico_completo(
                        _obter_valor(linha, mapa["codigo_completo"])
                    )
                    if not codigo_completo:
                        codigo_completo = _codigo_servico_completo(
                            _obter_valor(linha, mapa["iss_nacional"])
                        )
                    if not codigo_completo and payload:
                        codigo_completo = payload["codigo_completo"]
                    if not codigo_completo:
                        codigo_completo = _extrair_codigo_de_valores(linha)

                    codigo_nacional = _codigo_servico_nacional(codigo_completo)
                    if not codigo_nacional:
                        codigo_nacional = _codigo_servico_nacional(
                            _obter_valor(linha, mapa["iss_nacional"])
                        )

                    descricao = _obter_valor(linha, mapa["descricao"])
                    if not descricao and payload:
                        descricao = payload["descricao"]

                    iss_municipal = _obter_valor(linha, mapa["iss_municipal"])
                    if not iss_municipal and payload:
                        iss_municipal = payload["iss_municipal"]

                    aliquota = _normalizar_aliquota(
                        _obter_valor(linha, mapa["aliquota"])
                    )
                    if aliquota is None and payload:
                        aliquota = payload["aliquota"]

                    if not codigo_nacional or aliquota is None:
                        continue

                    vigencia_texto = _obter_valor(linha, mapa["vigencia"])

                    registros.append(
                        {
                            "municipio": codigo_municipio,
                            "codigo_completo": codigo_completo,
                            "codigo_completo_digitos": _somente_digitos(codigo_completo)[:9],
                            "iss_nacional": _formatar_codigo_nacional(codigo_nacional),
                            "iss_nacional_digitos": codigo_nacional,
                            "iss_municipal": iss_municipal,
                            "descricao": descricao,
                            "aliquota": aliquota,
                            "vigencia": _parse_data(vigencia_texto),
                            "vigencia_texto": vigencia_texto,
                        }
                    )

    except zipfile.BadZipFile as exc:
        raise APIExternaErro("O cache da base de alíquotas está corrompido.") from exc

    if not registros:
        raise APIExternaErro(
            "A base oficial foi baixada, mas nenhum registro de serviço pôde ser interpretado."
        )

    return tuple(registros)


def _filtrar_mais_recentes(candidatos: list[dict[str, Any]], competencia: date):
    vigentes = [
        item
        for item in candidatos
        if item["vigencia"] is None or item["vigencia"] <= competencia
    ]
    if vigentes:
        candidatos = vigentes

    mais_recentes: dict[str, dict[str, Any]] = {}
    for item in candidatos:
        chave = (
            item["codigo_completo"]
            or item["iss_municipal"]
            or item["descricao"]
            or item["iss_nacional"]
        )
        atual = mais_recentes.get(chave)
        if atual is None:
            mais_recentes[chave] = item
            continue

        if (item["vigencia"] or date.min) >= (atual["vigencia"] or date.min):
            mais_recentes[chave] = item

    return list(mais_recentes.values())


def consultar_aliquota_iss(
    codigo_municipio: int | str,
    codigo_servico: str,
    competencia: str | None,
) -> dict[str, Any]:
    municipio = _somente_digitos(codigo_municipio)
    if len(municipio) != 7:
        raise ValueError("Código IBGE do município inválido.")

    servico = (codigo_servico or "").strip()
    servico_nacional = _codigo_servico_nacional(servico)
    servico_completo = _codigo_servico_completo(servico)

    if not servico_nacional:
        raise ValueError(
            "Código do serviço inválido. Use o padrão 01.01.01 ou 01.01.01.000."
        )

    competencia_data = _normalizar_competencia(competencia)
    registros = _carregar_registros()

    registros_municipio = [
        item for item in registros if item["municipio"] == municipio
    ]

    # 1) Tenta código completo exato, inclusive o desdobramento municipal.
    candidatos: list[dict[str, Any]] = []
    if servico_completo:
        completo_digitos = _somente_digitos(servico_completo)[:9]
        candidatos = [
            item
            for item in registros_municipio
            if item["codigo_completo_digitos"] == completo_digitos
        ]

    # 2) Se não houver o .000 exato, procura todos os desdobramentos do mesmo
    # código nacional. Isso é importante quando o município usa .001, .002 etc.
    if not candidatos:
        candidatos = [
            item
            for item in registros_municipio
            if item["iss_nacional_digitos"] == servico_nacional
        ]

    if not candidatos:
        return {
            "encontrado": False,
            "aliquota": None,
            "alternativas": [],
            "municipio": int(municipio),
            "servico": servico,
            "competencia": _formatar_competencia(competencia_data),
            "fonte": "Portal Nacional NFS-e - Base pública de alíquotas ISSQN",
            "mensagem": (
                "Alíquota não localizada na base pública nacional para esta combinação."
            ),
            "possivel_desdobramento_municipal": True,
        }

    candidatos = _filtrar_mais_recentes(candidatos, competencia_data)

    alternativas = []
    vistos = set()
    for item in candidatos:
        chave = (
            item["aliquota"],
            item["codigo_completo"],
            item["iss_municipal"],
            item["descricao"],
        )
        if chave in vistos:
            continue
        vistos.add(chave)

        alternativas.append(
            {
                "codigo": item["codigo_completo"] or item["iss_nacional"],
                "codigo_municipal": item["iss_municipal"] or None,
                "descricao": item["descricao"] or None,
                "aliquota": item["aliquota"],
                "inicio": item["vigencia_texto"] or None,
                "fim": None,
            }
        )

    taxas = sorted({item["aliquota"] for item in alternativas})

    # Se todos os desdobramentos encontrados têm a mesma taxa, a resposta pode
    # ser usada automaticamente mesmo havendo vários códigos municipais.
    if len(taxas) == 1:
        return {
            "encontrado": True,
            "ambigua": False,
            "aliquota": taxas[0],
            "alternativas": alternativas,
            "municipio": int(municipio),
            "servico": servico,
            "competencia": _formatar_competencia(competencia_data),
            "fonte": "Portal Nacional NFS-e - Base pública de alíquotas ISSQN",
            "mensagem": "Alíquota localizada automaticamente na base oficial da NFS-e.",
        }

    return {
        "encontrado": True,
        "ambigua": True,
        "aliquota": None,
        "alternativas": alternativas,
        "municipio": int(municipio),
        "servico": servico,
        "competencia": _formatar_competencia(competencia_data),
        "fonte": "Portal Nacional NFS-e - Base pública de alíquotas ISSQN",
        "mensagem": (
            "A base oficial retornou mais de uma alíquota para este serviço. "
            "Selecione o desdobramento municipal aplicável."
        ),
    }


def diagnosticar_iss_municipio(codigo_municipio: int | str) -> dict[str, Any]:
    municipio = _somente_digitos(codigo_municipio)
    if len(municipio) != 7:
        raise ValueError("Código IBGE do município inválido.")

    registros = _carregar_registros()
    encontrados = [item for item in registros if item["municipio"] == municipio]

    return {
        "municipio": int(municipio),
        "quantidade_registros": len(encontrados),
        "servicos": [
            {
                "codigo_completo": item["codigo_completo"],
                "codigo_nacional": item["iss_nacional"],
                "codigo_municipal": item["iss_municipal"],
                "descricao": item["descricao"],
                "aliquota": item["aliquota"],
                "vigencia": item["vigencia_texto"],
            }
            for item in encontrados[:100]
        ],
    }
