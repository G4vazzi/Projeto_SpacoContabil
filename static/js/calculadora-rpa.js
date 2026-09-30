(() => {
    const root = document;

    const CONFIG = {
        salarioMinimo: 1621.00,
        tetoINSS: 8475.55,
        aliquotaINSS: 0.11,
        dependenteIRRF: 189.59,
        descontoSimplificado: 607.20,
        limiteDispensaIRRF: 10.00,
    };

    const el = (id) => root.getElementById(id);

    const valorBruto = el('rpa-valor-bruto');
    const dependentes = el('rpa-dependentes');
    const pensao = el('rpa-pensao');
    const baseAnterior = el('rpa-base-anterior');

    const uf = el('rpa-uf');
    const municipio = el('rpa-municipio');
    const municipioStatus = el('rpa-municipio-status');
    const servico = el('rpa-servico');
    const competencia = el('rpa-competencia');
    const aplicarISS = el('rpa-aplicar-iss');

    const issStatus = el('rpa-iss-status');
    const issAliquota = el('rpa-iss-aliquota');
    const issBadge = el('rpa-iss-badge');
    const issMensagem = el('rpa-iss-mensagem');
    const issFonte = el('rpa-iss-fonte');
    const issAlternativasArea = el('rpa-iss-alternativas-area');
    const issAlternativas = el('rpa-iss-alternativas');
    const issManualArea = el('rpa-iss-manual-area');
    const issManual = el('rpa-iss-manual');

    const regimeCNPJ = el('rpa-cnpj-regime');
    const cnpjAliquotaArea = el('rpa-cnpj-aliquota-area');
    const cnpjAliquota = el('rpa-cnpj-aliquota');
    const prolaboreCNPJ = el('rpa-cnpj-prolabore');

    const btnCalcular = el('rpa-calcular');
    const btnNovo = el('rpa-novo-calculo');
    const resultado = el('rpa-resultado');

    if (!valorBruto || !uf || !municipio || !servico || !competencia || !btnCalcular) {
        console.error('Calculadora RPA: elementos obrigatórios não encontrados.');
        return;
    }

    let aliquotaISSAuto = null;
    let dadosISSAtual = null;
    let consultaISSSeq = 0;

    function endpointRelativo(caminho) {
        return new URL(caminho, window.location.href).toString();
    }

    function formatarMoeda(valor) {
        return Number(valor || 0).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    }

    function formatarPercentual(valor) {
        return `${Number(valor || 0).toFixed(2).replace('.', ',')}%`;
    }

    function arredondar(valor) {
        return Math.round((Number(valor) + Number.EPSILON) * 100) / 100;
    }

    function converterMoeda(valor) {
        if (valor === null || valor === undefined || String(valor).trim() === '') {
            return 0;
        }

        let texto = String(valor)
            .trim()
            .replace(/R\$/gi, '')
            .replace(/\s/g, '');

        if (texto.includes(',')) {
            texto = texto.replace(/\./g, '').replace(',', '.');
        }

        const numero = Number(texto);
        return Number.isFinite(numero) ? numero : 0;
    }

    function aplicarMascaraMoeda(campo) {
        if (!campo) return;

        campo.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9,.]/g, '');
        });

        campo.addEventListener('focus', function () {
            const valor = converterMoeda(this.value);
            if (valor > 0) {
                this.value = valor.toFixed(2).replace('.', ',');
            }
        });

        campo.addEventListener('blur', function () {
            const valor = converterMoeda(this.value);
            this.value = valor > 0 ? formatarMoeda(valor) : '';
        });
    }

    [valorBruto, pensao, baseAnterior, prolaboreCNPJ].forEach(aplicarMascaraMoeda);

    function definirCompetenciaInicial() {
        if (competencia.value) return;

        const agora = new Date();
        if (agora.getFullYear() === 2026) {
            competencia.value = `2026-${String(agora.getMonth() + 1).padStart(2, '0')}`;
        } else {
            competencia.value = '2026-01';
        }
    }

    definirCompetenciaInicial();

    function mostrarISS({ tipo = 'info', aliquota = '-', badge = '', mensagem = '', fonte = '' }) {
        issStatus.classList.remove('rpa-hidden', 'rpa-iss-ok', 'rpa-iss-warning', 'rpa-iss-error', 'rpa-iss-loading');
        issStatus.classList.add(`rpa-iss-${tipo}`);
        issAliquota.textContent = aliquota;
        issBadge.textContent = badge;
        issMensagem.textContent = mensagem;
        issFonte.textContent = fonte;
    }

    function limparISS() {
        aliquotaISSAuto = null;
        dadosISSAtual= null;
        issStatus.classList.add('rpa-hidden');
        issAlternativasArea.classList.add('rpa-hidden');
        issManualArea.classList.add('rpa-hidden');
        issAlternativas.innerHTML = '';
        issManual.value = '';
    }

    async function carregarMunicipios() {
        const sigla = uf.value;
        limparISS();

        municipio.innerHTML = '<option value="">Carregando municípios...</option>';
        municipio.disabled = true;
        municipioStatus.textContent = '';

        if (!sigla) {
            municipio.innerHTML = '<option value="">Selecione primeiro o estado</option>';
            return;
        }

        try {
            const resposta = await fetch(endpointRelativo(`api/municipios/${encodeURIComponent(sigla)}`), {
                headers: { Accept: 'application/json' },
            });
            const dados = await resposta.json();

            if (!resposta.ok || !dados.ok) {
                throw new Error(dados.erro || 'Falha ao carregar municípios.');
            }

            municipio.innerHTML = '<option value="">Selecione o município</option>';
            for (const item of dados.municipios) {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = item.nome;
                municipio.appendChild(option);
            }

            municipio.disabled = false;
            municipioStatus.textContent = `${dados.municipios.length} município(s) carregado(s) pelo IBGE.`;
        } catch (erro) {
            municipio.innerHTML = '<option value="">Não foi possível carregar</option>';
            municipioStatus.textContent = erro.message;
        }
    }

    async function consultarISS() {
        const codigoMunicipio = municipio.value;
        const codigoServico = servico.value;
        const comp = competencia.value;

        aliquotaISSAuto = null;
        dadosISSAtual = null;
        issAlternativasArea.classList.add('rpa-hidden');
        issManualArea.classList.add('rpa-hidden');
        issAlternativas.innerHTML = '';

        if (!codigoMunicipio || !codigoServico || !comp) {
            issStatus.classList.add('rpa-hidden');
            return;
        }

        const minhaConsulta = ++consultaISSSeq;

        mostrarISS({
            tipo: 'loading',
            aliquota: '...',
            badge: 'Consultando',
            mensagem: 'Buscando a alíquota na base nacional da NFS-e.',
            fonte: '',
        });

        const params = new URLSearchParams({
            municipio: codigoMunicipio,
            servico: codigoServico,
            competencia: comp,
        });

        try {
            const resposta = await fetch(endpointRelativo(`api/iss?${params.toString()}`), {
                headers: { Accept: 'application/json' },
            });
            const dados = await resposta.json();

            if (minhaConsulta !== consultaISSSeq) return;

            if (!resposta.ok || !dados.ok) {
                throw new Error(dados.erro || 'Não foi possível consultar a alíquota.');
            }

            if (dados.encontrado && !dados.ambigua && dados.aliquota !== null) {
                aliquotaISSAuto = Number(dados.aliquota);
                dadosISSAtual = dados;
                mostrarISS({
                    tipo: 'ok',
                    aliquota: formatarPercentual(aliquotaISSAuto),
                    badge: 'Encontrada',
                    mensagem: dados.mensagem || 'Alíquota localizada automaticamente.',
                    fonte: `Fonte: ${dados.fonte} • Competência: ${dados.competencia}`,
                });
                return;
            }

            if (dados.encontrado && dados.ambigua && Array.isArray(dados.alternativas)) {
                dadosISSAtual = dados;
                const taxas = new Map();
                for (const item of dados.alternativas) {
                    const taxa = Number(item.aliquota);
                    if (!Number.isFinite(taxa)) continue;
                    const chave = `${taxa}|${item.incidencia || ''}`;
                    if (!taxas.has(chave)) taxas.set(chave, item);
                }

                issAlternativas.innerHTML = '<option value="">Selecione a alíquota aplicável</option>';
                for (const item of taxas.values()) {
                    const option = document.createElement('option');
                    option.value = item.aliquota;
                    option.textContent = `${formatarPercentual(item.aliquota)}${item.incidencia ? ` - ${item.incidencia}` : ''}`;
                    issAlternativas.appendChild(option);
                }

                issAlternativasArea.classList.remove('rpa-hidden');
                mostrarISS({
                    tipo: 'warning',
                    aliquota: 'Mais de uma',
                    badge: 'Revisar',
                    mensagem: 'A base nacional retornou mais de uma alíquota. Selecione a alternativa aplicável antes de calcular.',
                    fonte: `Fonte: ${dados.fonte}`,
                });
                return;
            }

            issManualArea.classList.remove('rpa-hidden');
            mostrarISS({
                tipo: 'warning',
                aliquota: 'Não localizada',
                badge: 'Manual',
                mensagem: dados.possivel_desdobramento_municipal
                    ? 'A alíquota não foi localizada. O município pode utilizar desdobramento municipal do código de serviço. Informe a alíquota manualmente.'
                    : (dados.mensagem || 'A alíquota não foi localizada na base nacional.'),
                fonte: `Fonte consultada: ${dados.fonte}`,
            });
        } catch (erro) {
            if (minhaConsulta !== consultaISSSeq) return;
            issManualArea.classList.remove('rpa-hidden');
            mostrarISS({
                tipo: 'error',
                aliquota: 'Indisponível',
                badge: 'Fallback manual',
                mensagem: erro.message,
                fonte: 'A calculadora pode continuar com a alíquota informada manualmente.',
            });
        }
    }

    function obterAliquotaISS() {
        if (aplicarISS.value === 'nao') {
            return { valida: true, aliquota: 0, origem: 'não aplicada' };
        }

        if (aliquotaISSAuto !== null && Number.isFinite(aliquotaISSAuto)) {
            return { valida: true, aliquota: aliquotaISSAuto, origem: 'NFS-e Nacional' };
        }

        if (!issAlternativasArea.classList.contains('rpa-hidden')) {
            const valor = Number(issAlternativas.value);
            if (issAlternativas.value !== '' && Number.isFinite(valor) && valor >= 0 && valor <= 5) {
                return { valida: true, aliquota: valor, origem: 'NFS-e Nacional - alternativa selecionada' };
            }
            return { valida: false, mensagem: 'Selecione uma das alíquotas retornadas pela NFS-e.' };
        }

        const textoManual = String(issManual.value || '').trim().replace(',', '.');
        if (textoManual === '') {
            return { valida: false, mensagem: 'Informe a alíquota manual de ISS.' };
        }

        const valorManual = Number(textoManual);
        if (!Number.isFinite(valorManual) || valorManual < 0 || valorManual > 5) {
            return { valida: false, mensagem: 'A alíquota manual de ISS deve estar entre 0% e 5%.' };
        }

        return { valida: true, aliquota: valorManual, origem: 'informada manualmente' };
    }

    function obterAliquotaCNPJ() {
        if (regimeCNPJ.value !== 'personalizado') {
            return Number(regimeCNPJ.value);
        }

        const texto = String(cnpjAliquota.value || '').trim().replace(',', '.');
        if (texto === '') return null;

        const valor = Number(texto);
        if (!Number.isFinite(valor) || valor < 0 || valor > 33) return null;
        return valor;
    }

    function calcularINSS(remuneracao, baseJaUtilizada) {
        const baseAnteriorLimitada = Math.min(Math.max(baseJaUtilizada, 0), CONFIG.tetoINSS);
        const limiteDisponivel = Math.max(0, CONFIG.tetoINSS - baseAnteriorLimitada);
        const baseAtual = Math.min(Math.max(remuneracao, 0), limiteDisponivel);
        return arredondar(baseAtual * CONFIG.aliquotaINSS);
    }

    function calcularTabelaIRRF(base) {
        if (base <= 2428.80) return 0;
        if (base <= 2826.65) return base * 0.075 - 182.16;
        if (base <= 3751.05) return base * 0.15 - 394.16;
        if (base <= 4664.68) return base * 0.225 - 675.49;
        return base * 0.275 - 908.73;
    }

    function calcularReducaoIR(rendimento, imposto) {
        if (imposto <= 0) return 0;
        if (rendimento <= 5000) return Math.min(imposto, 312.89);
        if (rendimento <= 7350) {
            return Math.min(imposto, Math.max(0, 978.62 - 0.133145 * rendimento));
        }
        return 0;
    }

    function calcularIRRF(rendimento, inss, numeroDependentes, valorPensao) {
        const deducoesLegais = inss + numeroDependentes * CONFIG.dependenteIRRF + valorPensao;
        const deducaoUsada = Math.max(deducoesLegais, CONFIG.descontoSimplificado);
        const baseIRRF = Math.max(0, rendimento - deducaoUsada);
        let imposto = Math.max(0, calcularTabelaIRRF(baseIRRF));
        imposto = arredondar(Math.max(0, imposto - calcularReducaoIR(rendimento, imposto)));
        if (imposto > 0 && imposto <= CONFIG.limiteDispensaIRRF) imposto = 0;
        return imposto;
    }

    function preencher(id, texto) {
        const elemento = el(id);
        if (elemento) elemento.textContent = texto;
    }

    function calcular() {
        const bruto = converterMoeda(valorBruto.value);
        if (bruto <= 0) {
            alert('Informe o valor bruto do serviço.');
            valorBruto.focus();
            return;
        }

        if (!municipio.value) {
            alert('Selecione o município onde o ISS é devido.');
            municipio.focus();
            return;
        }

        if (!servico.value) {
            alert('Selecione a atividade ou serviço prestado.');
            servico.focus();
            return;
        }

        if (!competencia.value || !competencia.value.startsWith('2026-')) {
            alert('Selecione uma competência de 2026.');
            competencia.focus();
            return;
        }

        const iss = obterAliquotaISS();
        if (!iss.valida) {
            alert(iss.mensagem);
            return;
        }

        const numeroDependentes = Math.max(0, parseInt(dependentes.value, 10) || 0);
        const valorPensao = converterMoeda(pensao.value);
        const baseINSSAnterior = converterMoeda(baseAnterior.value);

        if (valorPensao > bruto) {
            alert('A pensão dedutível não pode ser maior que o valor bruto.');
            pensao.focus();
            return;
        }

        const inssAutonomo = calcularINSS(bruto, baseINSSAnterior);
        const irrfAutonomo = calcularIRRF(bruto, inssAutonomo, numeroDependentes, valorPensao);
        const issAutonomo = arredondar(bruto * (iss.aliquota / 100));
        const descontosAutonomo = arredondar(inssAutonomo + irrfAutonomo + issAutonomo);
        const liquidoAutonomo = arredondar(bruto - descontosAutonomo);

        const aliquotaDAS = obterAliquotaCNPJ();
        if (aliquotaDAS === null) {
            alert('Informe uma alíquota efetiva válida para o CNPJ.');
            cnpjAliquota.focus();
            return;
        }

        const prolabore = converterMoeda(prolaboreCNPJ.value);
        if (prolabore <= 0) {
            alert('Informe o pró-labore usado no cenário com CNPJ.');
            prolaboreCNPJ.focus();
            return;
        }

        const das = arredondar(bruto * (aliquotaDAS / 100));
        const inssCNPJ = calcularINSS(prolabore, baseINSSAnterior);
        const irrfCNPJ = calcularIRRF(prolabore, inssCNPJ, numeroDependentes, valorPensao);
        const descontosCNPJ = arredondar(das + inssCNPJ + irrfCNPJ);
        const liquidoCNPJ = arredondar(bruto - descontosCNPJ);

        preencher('rpa-card-autonomo', formatarMoeda(liquidoAutonomo));
        preencher('rpa-card-cnpj', formatarMoeda(liquidoCNPJ));
        preencher('rpa-autonomo-bruto', formatarMoeda(bruto));
        preencher('rpa-cnpj-bruto', formatarMoeda(bruto));
        preencher('rpa-autonomo-inss', formatarMoeda(inssAutonomo));
        preencher('rpa-cnpj-inss', formatarMoeda(inssCNPJ));
        preencher('rpa-autonomo-irrf', formatarMoeda(irrfAutonomo));
        preencher('rpa-cnpj-irrf', formatarMoeda(irrfCNPJ));
        preencher('rpa-autonomo-iss', formatarMoeda(issAutonomo));
        preencher('rpa-autonomo-iss-pct', aplicarISS.value === 'nao' ? 'não aplicado' : formatarPercentual(iss.aliquota));
        preencher('rpa-cnpj-das', formatarMoeda(das));
        preencher('rpa-cnpj-das-pct', formatarPercentual(aliquotaDAS));
        preencher('rpa-autonomo-total', formatarMoeda(descontosAutonomo));
        preencher('rpa-cnpj-total', formatarMoeda(descontosCNPJ));
        preencher('rpa-autonomo-liquido', formatarMoeda(liquidoAutonomo));
        preencher('rpa-cnpj-liquido', formatarMoeda(liquidoCNPJ));

        const diferenca = arredondar(liquidoCNPJ - liquidoAutonomo);
        preencher('rpa-diferenca-valor', formatarMoeda(Math.abs(diferenca)));

        if (diferenca > 0) {
            preencher('rpa-comparativo-titulo', 'Neste cálculo, o cenário com CNPJ deixa mais dinheiro líquido.');
            preencher('rpa-comparativo-subtitulo', 'Veja abaixo como os descontos estimados foram distribuídos.');
            preencher('rpa-diferenca-texto', `O cenário com CNPJ resulta em ${formatarMoeda(diferenca)} a mais neste cálculo.`);
        } else if (diferenca < 0) {
            preencher('rpa-comparativo-titulo', 'Neste cálculo, o cenário autônomo deixa mais dinheiro líquido.');
            preencher('rpa-comparativo-subtitulo', 'Veja abaixo como os descontos estimados foram distribuídos.');
            preencher('rpa-diferenca-texto', `O cenário autônomo resulta em ${formatarMoeda(Math.abs(diferenca))} a mais neste cálculo.`);
        } else {
            preencher('rpa-comparativo-titulo', 'Os dois cenários apresentam o mesmo valor líquido.');
            preencher('rpa-comparativo-subtitulo', 'Não houve diferença no resultado desta simulação.');
            preencher('rpa-diferenca-texto', 'Diferença de R$ 0,00.');
        }

        const municipioNome = municipio.options[municipio.selectedIndex]?.textContent || '';
        const servicoNome = servico.options[servico.selectedIndex]?.textContent || servico.value;
        preencher(
            'rpa-premissas-texto',
            `ISS ${formatarPercentual(iss.aliquota)} (${iss.origem}); ${municipioNome}; serviço ${servicoNome}; ` +
            `DAS ${formatarPercentual(aliquotaDAS)}; pró-labore ${formatarMoeda(prolabore)}; competência ${competencia.value}.`
        );

        resultado.classList.remove('rpa-hidden');
        resultado.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    uf.addEventListener('change', carregarMunicipios);
    municipio.addEventListener('change', consultarISS);
    servico.addEventListener('change', consultarISS);
    competencia.addEventListener('change', consultarISS);

    issAlternativas.addEventListener('change', function () {
        if (this.value === '') {
            aliquotaISSAuto = null;
            return;
        }
        aliquotaISSAuto = Number(this.value);
        issAliquota.textContent = formatarPercentual(aliquotaISSAuto);
        issBadge.textContent = 'Selecionada';
    });

    regimeCNPJ.addEventListener('change', function () {
        cnpjAliquotaArea.classList.toggle('rpa-hidden', this.value !== 'personalizado');
        if (this.value !== 'personalizado') cnpjAliquota.value = '';
    });

    btnCalcular.addEventListener('click', calcular);

    if (btnNovo) {
        btnNovo.addEventListener('click', () => {
            resultado.classList.add('rpa-hidden');
            document.querySelector('.rpa-box')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }
})();
