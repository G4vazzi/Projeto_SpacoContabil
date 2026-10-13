from flask import (
    Blueprint,
    request,
    jsonify,
    current_app,
)

import os
import smtplib

from email.message import EmailMessage

import sqlite3
import re

from pathlib import Path
from datetime import (
    datetime,
    timezone,
    timedelta,
)


# =========================================================
# BLUEPRINT
# =========================================================

contato_bp = Blueprint(
    "contato",
    __name__,
)


# =========================================================
# BANCO DE DADOS
# =========================================================

def caminho_banco():

    instance_path = Path(
        current_app.instance_path
    )

    instance_path.mkdir(
        parents=True,
        exist_ok=True
    )

    return (
        instance_path /
        "spaco_contatos.db"
    )


def conectar_banco():

    conexao = sqlite3.connect(
        caminho_banco(),
        timeout=10
    )

    conexao.row_factory = sqlite3.Row

    return conexao


# =========================================================
# CRIAR TABELA
# =========================================================

def criar_tabela_contatos():

    with conectar_banco() as conexao:

        conexao.execute(
            """
            CREATE TABLE IF NOT EXISTS contatos (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                nome TEXT NOT NULL,

                telefone TEXT NOT NULL,

                email TEXT NOT NULL,

                aceite INTEGER NOT NULL DEFAULT 1,

                status TEXT NOT NULL DEFAULT 'novo',

                criado_em TEXT NOT NULL

            )
            """
        )


# =========================================================
# VALIDAÇÃO
# =========================================================

def email_valido(email):

    padrao = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

    return bool(
        re.match(
            padrao,
            email
        )
    )


def limpar_telefone(telefone):

    return re.sub(
        r"\D",
        "",
        telefone or ""
    )


# =========================================================
# VERIFICAR ENVIO DUPLICADO
# =========================================================

def envio_recente(
    telefone,
    email
):

    limite = (
        datetime.now(timezone.utc)
        -
        timedelta(seconds=60)
    )

    limite_texto = (
        limite.isoformat()
    )

    with conectar_banco() as conexao:

        contato = conexao.execute(
            """
            SELECT id
            FROM contatos

            WHERE
                (
                    telefone = ?
                    OR LOWER(email) = LOWER(?)
                )

                AND criado_em >= ?

            LIMIT 1
            """,
            (
                telefone,
                email,
                limite_texto,
            )
        ).fetchone()

    return contato is not None


# =========================================================
# SALVAR CONTATO
# =========================================================

def salvar_contato(
    nome,
    telefone,
    email,
    aceite
):

    criado_em = (
        datetime
        .now(timezone.utc)
        .isoformat()
    )

    with conectar_banco() as conexao:

        cursor = conexao.execute(
            """
            INSERT INTO contatos (

                nome,
                telefone,
                email,
                aceite,
                status,
                criado_em

            )

            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                nome,
                telefone,
                email,
                1 if aceite else 0,
                "novo",
                criado_em,
            )
        )

        contato_id = cursor.lastrowid

    return contato_id

# =========================================================
# EMAIL DE CONFIRMAÇÃO
# =========================================================

def enviar_email_confirmacao(
    nome,
    email,
    contato_id
):

    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(
        os.getenv("SMTP_PORT", "465")
    )

    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv(
        "SMTP_PASSWORD"
    )

    smtp_from = os.getenv(
        "SMTP_FROM",
        smtp_user
    )

    smtp_from_name = os.getenv(
        "SMTP_FROM_NAME",
        "Spaco Contábil"
    )


    if not all([
        smtp_host,
        smtp_user,
        smtp_password,
        smtp_from,
    ]):

        current_app.logger.warning(
            "SMTP não configurado."
        )

        return False


    mensagem = EmailMessage()


    mensagem["Subject"] = (
        "Recebemos sua solicitação | "
        "Spaco Contábil"
    )

    mensagem["From"] = (
        f"{smtp_from_name} <{smtp_from}>"
    )

    mensagem["To"] = email


    # TEXTO SIMPLES

    mensagem.set_content(
    f"""
    Olá, {nome}!

    Recebemos sua solicitação de contato com sucesso.

    Nossa equipe entrará em contato com você em breve.

    Protocolo: #{contato_id}

    Atenciosamente,
    Spaco Contábil

    Esta é uma mensagem automática.
    Por favor, não responda este e-mail.
    """
    )


    # HTML

    mensagem.add_alternative(
        f"""
<!DOCTYPE html>

<html lang="pt-BR">

<body
    style="
        margin: 0;
        background: #F4F7FB;
        font-family: Arial, sans-serif;
    "
>

    <div
        style="
            max-width: 600px;
            margin: 30px auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #E4EAF2;
        "
    >

        <div
            style="
                background: #0B3B91;
                padding: 28px;
                text-align: center;
            "
        >

            <h1
                style="
                    margin: 0;
                    color: white;
                    font-size: 24px;
                "
            >
                Spaco Contábil
            </h1>

        </div>


        <div
            style="
                padding: 32px;
                color: #334155;
            "
        >

            <h2
                style="
                    margin-top: 0;
                    color: #0B3B91;
                "
            >
                Olá, {nome}!
            </h2>


            <p
                style="
                    line-height: 1.7;
                "
            >
                Recebemos sua solicitação
                de contato com sucesso.
            </p>


            <p
                style="
                    line-height: 1.7;
                "
            >
                Nossa equipe entrará em contato
                com você em breve.
            </p>


            <div
                style="
                    margin: 25px 0;
                    padding: 18px;
                    background: #F0F8FF;
                    border-left: 4px solid #FFD700;
                    border-radius: 6px;
                "
            >

                <strong
                    style="
                        color: #0B3B91;
                    "
                >
                    Protocolo
                </strong>

                <br>

                #{contato_id}

            </div>


            <p>
                Atenciosamente,<br>

                <strong>
                    Spaco Contábil
                </strong>
            </p>

        </div>

        <div
            style="
                padding: 18px 25px;
                text-align: center;
                background: #F8FAFC;
                border-top: 1px solid #E4EAF2;
                color: #64748B;
                font-size: 12px;
                line-height: 1.6;
            ">
            
            Este é um e-mail automático.<br>
            Por favor, não responda esta mensagem.
        </div>

    </div>

</body>

</html>
""",
        subtype="html"
    )


    try:

        with smtplib.SMTP_SSL(
            smtp_host,
            smtp_port,
            timeout=20
        ) as servidor:

            servidor.login(
                smtp_user,
                smtp_password
            )

            servidor.send_message(
                mensagem
            )


        current_app.logger.info(
            "E-mail enviado para %s",
            email
        )


        return True


    except Exception as erro:

        current_app.logger.exception(
            "Erro ao enviar e-mail: %s",
            erro
        )

        return False

# =========================================================
# API - RECEBER FORMULÁRIO
# =========================================================

@contato_bp.post(
    "/api/contato"
)
def receber_contato():

    try:

        dados = (
            request.get_json(
                silent=True
            )
            or {}
        )


        # =================================================
        # HONEYPOT ANTISPAM
        # =================================================

        website = str(
            dados.get(
                "website",
                ""
            )
        ).strip()


        if website:

            # Fingimos sucesso para bots.

            return jsonify({

                "ok": True,

                "mensagem":
                    "Solicitação registrada."

            })


        # =================================================
        # DADOS
        # =================================================

        nome = str(
            dados.get(
                "nome",
                ""
            )
        ).strip()


        telefone = (
            limpar_telefone(
                dados.get(
                    "telefone",
                    ""
                )
            )
        )


        email = str(
            dados.get(
                "email",
                ""
            )
        ).strip().lower()


        aceite = (
            dados.get(
                "aceite"
            )
            is True
        )


        # =================================================
        # VALIDAR NOME
        # =================================================

        if len(nome) < 3:

            return jsonify({

                "ok": False,

                "erro":
                    "Informe seu nome completo."

            }), 400


        if len(nome) > 100:

            return jsonify({

                "ok": False,

                "erro":
                    "O nome informado é muito longo."

            }), 400


        # =================================================
        # VALIDAR TELEFONE
        # =================================================

        if len(telefone) not in (
            10,
            11,
        ):

            return jsonify({

                "ok": False,

                "erro":
                    "Informe um telefone válido com DDD."

            }), 400


        # =================================================
        # VALIDAR EMAIL
        # =================================================

        if (
            len(email) > 254
            or
            not email_valido(email)
        ):

            return jsonify({

                "ok": False,

                "erro":
                    "Informe um endereço de e-mail válido."

            }), 400


        # =================================================
        # CONSENTIMENTO
        # =================================================

        if not aceite:

            return jsonify({

                "ok": False,

                "erro":
                    "É necessário autorizar o contato."

            }), 400


        # =================================================
        # GARANTIR TABELA
        # =================================================

        criar_tabela_contatos()


        # =================================================
        # EVITAR VÁRIOS CLIQUES SEGUIDOS
        # =================================================

        if envio_recente(
            telefone,
            email
        ):

            return jsonify({

                "ok": True,

                "duplicado": True,

                "mensagem":
                    "Sua solicitação já foi registrada."

            })


        # =================================================
        # SALVAR
        # =================================================

        contato_id = salvar_contato(

            nome=nome,

            telefone=telefone,

            email=email,

            aceite=aceite,

        )

        email_enviado = enviar_email_confirmacao(

            nome=nome,

            email=email,

            contato_id=contato_id,

            
        )


        # =================================================
        # SUCESSO
        # =================================================

        return jsonify({

            "ok": True,

            "id": contato_id,

            "email_enviado":
                email_enviado,

            "mensagem":
                "Solicitação registrada com sucesso!"

        }), 201


    except sqlite3.Error as erro:

        current_app.logger.exception(
            "Erro ao salvar contato: %s",
            erro
        )

        return jsonify({

            "ok": False,

            "erro":
                "Não foi possível registrar sua solicitação."

        }), 500


    except Exception as erro:

        current_app.logger.exception(
            "Erro inesperado no formulário: %s",
            erro
        )

        return jsonify({

            "ok": False,

            "erro":
                "Ocorreu um erro inesperado."

        }), 500