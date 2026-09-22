document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const form =
        document.getElementById(
            "form-calculadora-abertura"
        );

    const estado =
        document.getElementById("estado");

    const naturezaJuridica =
        document.getElementById(
            "natureza-juridica"
        );

    const atividade =
        document.getElementById("atividade");

    const faturamento =
        document.getElementById("faturamento");


    /* =====================================================
       ÁREA MEI
    ===================================================== */

    const areaMei =
        document.getElementById("area-mei");

    const categoriaMei =
        document.getElementById("categoria-mei");

    const atividadeMei =
        document.getElementById("atividade-mei");

    const quantidadeEmpregados =
        document.getElementById(
            "quantidade-empregados"
        );

    const outraEmpresa =
        document.getElementById("outra-empresa");

    const filial =
        document.getElementById("filial");

    const mesAbertura =
        document.getElementById("mes-abertura");


    /* =====================================================
       RESULTADO
    ===================================================== */

    const resultado =
        document.getElementById(
            "resultado-abertura"
        );

    const valorResultado =
        document.getElementById(
            "valor-resultado"
        );

    const resultadoEstado =
        document.getElementById(
            "resultado-estado"
        );

    const resultadoNatureza =
        document.getElementById(
            "resultado-natureza"
        );

    const resultadoAtividade =
        document.getElementById(
            "resultado-atividade"
        );

    const resultadoFaturamento =
        document.getElementById(
            "resultado-faturamento"
        );

    const resultadoPorte =
        document.getElementById(
            "resultado-porte"
        );

    const resultadoLimite =
        document.getElementById(
            "resultado-limite"
        );

    const resultadoJunta =
        document.getElementById(
            "resultado-junta"
        );

    const resultadoCertificado =
        document.getElementById(
            "resultado-certificado"
        );

    const resultadoServico =
        document.getElementById(
            "resultado-servico"
        );

    const resultadoAlerta =
        document.getElementById(
            "resultado-alerta"
        );

    const resultadoDetalhamento =
        document.getElementById(
            "resultado-detalhamento"
        );

    const resultadoMeiMensagem =
        document.getElementById(
            "resultado-mei-mensagem"
        );

    const resultadoMeiTitulo =
        document.getElementById(
            "resultado-mei-titulo"
        );

    const resultadoMeiTexto =
        document.getElementById(
            "resultado-mei-texto"
        );

    const resultadoStatusLabel =
        document.getElementById(
            "resultado-status-label"
        );

    const novoCalculo =
        document.getElementById(
            "novo-calculo"
        );


    /* =====================================================
       CUSTOS FIXOS
       
       Estes são os valores do nosso serviço.
    ===================================================== */

    const custosFixos = {

        certificadoDigital: 235.00,

        servicoAbertura: 500.00

    };


    /* =====================================================
       TAXAS DAS JUNTAS
       
       IMPORTANTE:

       Não estamos inventando valores.

       null = valor ainda não levantado/verificado.
       
       Os valores do CE abaixo são os valores que você
       apresentou na referência.
    ===================================================== */

    const taxasRegistro = {

        CE: {

            MEI: 0,

            EI: 147.76,

            LTDA: 259.65,

            SA: 472.63,

        },


        AC: {
            MEI: 0,

            EI: 381.73,

            LTDA: 651.22,

            SA: 1280.02,
        },

        AL: {
            MEI: 0,

            EI: 268.00,

            LTDA: 462.00,

            SA: 785.00,
        },

        AP: {
            MEI: 0,

            EI: 160,

            LTDA: 325,

            SA: 720.00,
        },

        AM: {
            MEI: 0,

            EI: 356.98,

            LTDA: 608.79,

            SA: 942.67,
        },

        BA: {
            MEI: 0,

            EI: 156,

            LTDA: 360,

            SA: 670,
        },

        DF: {
            MEI: 0,

            EI: 216.34,

            LTDA: 425.45,

            SA: 650,
        },

        ES: {
            MEI: 0,

            EI: 203.46,

            LTDA: 437.43,

            SA: 525,
        },

        GO: {
            MEI: 0,

            EI: 210,

            LTDA: 356,

            SA: 758,
        },

        MA: {
            MEI: 0,

            EI: 133,

            LTDA: 304,

            SA: 557,
        },

        MT: {
            MEI: 0,

            EI: 105,

            LTDA: 210,

            SA: 406,
        },

        MS: {
            MEI: 0,

            EI: 240,

            LTDA: 360,

            SA: 372.5,
        },

        MG: {
            MEI: 0,

            EI: 147.59,

            LTDA: 323.93,

            SA: 450,
        },

        PA: {
            MEI: 0,

            EI: 211,

            LTDA: 519,

            SA: 980,
        },

        PB: {
            MEI: 0,

            EI: 112,

            LTDA: 224,

            SA: 780,
        },

        PR: {
            MEI: 0,

            EI: 92.40,

            LTDA: 128.30,

            SA: 256.65,
        },

        PE: {
            MEI: 0,

            EI: 137.00,

            LTDA: 396.00,

            SA: 757.00,
        },

        PI: {
            MEI: 0,

            EI: 275.30,

            LTDA: 475.75,

            SA: 793,
        },

        RJ: {
            MEI: 0,

            EI: 210,

            LTDA: 440,

            SA: 950,
        },

        RN: {
            MEI: 0,

            EI: 392.50,

            LTDA: 672.80,

            SA: 1055.00,
        },

        RS: {
            MEI: 0,

            EI: 118.40,

            LTDA: 205.02,

            SA: 514.02,
        },

        RO: {
            MEI: 0,

            EI: 387.89,

            LTDA: 579.51,

            SA: 1000,
        },

        RR: {
            MEI: 0,

            EI: 162.50,

            LTDA: 385.00,

            SA: 1000,
        },

        SC: {
            MEI: 0,

            EI: 82.00,

            LTDA: 168.00,

            SA: 525.00,
        },

        SP: {
            MEI: 0,

            EI: 101.10,

            LTDA: 246.27,

            SA: 583.98,
        },

        SE: {
            MEI: 0,

            EI: 298.00,

            LTDA: 442.00,

            SA: 815.00,
        },

        TO: {
            MEI: 0,

            EI: 167.00,

            LTDA: 410.00,

            SA: 850.00,
        }

    };


    /* =====================================================
       NOMES
    ===================================================== */

    const nomesEstados = {

        AC: "Acre",
        AL: "Alagoas",
        AP: "Amapá",
        AM: "Amazonas",
        BA: "Bahia",
        CE: "Ceará",
        DF: "Distrito Federal",
        ES: "Espírito Santo",
        GO: "Goiás",
        MA: "Maranhão",
        MT: "Mato Grosso",
        MS: "Mato Grosso do Sul",
        MG: "Minas Gerais",
        PA: "Pará",
        PB: "Paraíba",
        PR: "Paraná",
        PE: "Pernambuco",
        PI: "Piauí",
        RJ: "Rio de Janeiro",
        RN: "Rio Grande do Norte",
        RS: "Rio Grande do Sul",
        RO: "Rondônia",
        RR: "Roraima",
        SC: "Santa Catarina",
        SP: "São Paulo",
        SE: "Sergipe",
        TO: "Tocantins"

    };


    const nomesNaturezas = {

        MEI:
            "Microempreendedor Individual (MEI)",

        EI:
            "Empresário Individual (EI)",

        SA:
            "Sociedade Anônima (S/A)",

        SOCIEDADE_SIMPLES_LIMITADA:
            "Sociedade Simples Limitada",

        SLU:
            "Sociedade Limitada Unipessoal (SLU)"

    };


    const nomesAtividades = {

        comercio:
            "Comércio",

        servicos:
            "Prestação de Serviços",

        industria:
            "Indústria",

        tecnologia:
            "Tecnologia",

        consultoria:
            "Consultoria",

        profissional:
            "Profissional Liberal",

        outra:
            "Outra atividade"

    };


    /* =====================================================
       MÁSCARA DE DINHEIRO
    ===================================================== */

    faturamento.addEventListener(
        "input",
        function () {

            let valor =
                this.value.replace(/\D/g, "");


            if (!valor) {

                this.value = "";

                return;

            }


            valor =
                parseInt(valor, 10) / 100;


            this.value =
                valor.toLocaleString(
                    "pt-BR",
                    {
                        style: "currency",
                        currency: "BRL"
                    }
                );

        }
    );


    /* =====================================================
       CONVERTER VALOR
    ===================================================== */

    function converterValor(valor) {

        if (!valor) {
            return 0;
        }

        valor =
            valor
                .replace("R$", "")
                .replace(/\./g, "")
                .replace(",", ".")
                .trim();


        return parseFloat(valor) || 0;

    }


    /* =====================================================
       MOEDA
    ===================================================== */

    function formatarMoeda(valor) {

        return valor.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }


    /* =====================================================
       GRATUITO
    ===================================================== */

    function formatarCusto(valor) {

        if (valor === 0) {

            return "Gratuito";

        }

        return formatarMoeda(valor);

    }


    /* =====================================================
       PORTE
       
       O porte NÃO define a taxa da Junta.
    ===================================================== */

    function identificarPorte(
        faturamentoMensal
    ) {

        const anual =
            faturamentoMensal * 12;


        if (anual <= 360000) {

            return "ME";

        }


        if (anual <= 4800000) {

            return "EPP";

        }


        return "Acima de EPP";

    }


    /* =====================================================
       LIMITE MEI
    ===================================================== */

    function calcularLimiteMei(
        categoria,
        mes
    ) {

        /*
         * MEI Caminhoneiro:
         * R$ 251.600 por ano
         */

        if (
            categoria === "CAMINHONEIRO"
        ) {

            return 251600;

        }


        /*
         * MEI comum:
         * R$ 6.750 por mês
         */

        const limiteMensal =
            6750;


        const mesesAtividade =
            13 - Number(mes);


        return (
            limiteMensal *
            mesesAtividade
        );

    }


    /* =====================================================
       VERIFICAR REGRAS MEI
    ===================================================== */

    function verificarMei(
        faturamentoMensal
    ) {

        const categoria =
            categoriaMei.value;

        const atividadePermitida =
            atividadeMei.value;

        const empregados =
            quantidadeEmpregados.value;

        const participaOutra =
            outraEmpresa.value;

        const possuiFilial =
            filial.value;

        const mes =
            Number(mesAbertura.value);


        /* -----------------------------
           CAMPOS OBRIGATÓRIOS
        ----------------------------- */

        if (!atividadePermitida) {

            return {

                valido: false,

                motivo:
                    "Informe se sua ocupação está na lista de atividades permitidas para MEI."

            };

        }


        if (!empregados) {

            return {

                valido: false,

                motivo:
                    "Informe a quantidade de empregados."

            };

        }


        if (!participaOutra) {

            return {

                valido: false,

                motivo:
                    "Informe se você participa de outra empresa."

            };

        }


        if (!possuiFilial) {

            return {

                valido: false,

                motivo:
                    "Informe se a empresa terá filial."

            };

        }


        if (!mes) {

            return {

                valido: false,

                motivo:
                    "Informe o mês previsto para abertura."

            };

        }


        /* -----------------------------
           ATIVIDADE
        ----------------------------- */

        if (
            atividadePermitida === "NAO"
        ) {

            return {

                valido: false,

                motivo:
                    "A atividade informada não está sendo considerada compatível com o MEI."

            };

        }


        /* -----------------------------
           EMPREGADOS
        ----------------------------- */

        if (
            empregados === "2"
        ) {

            return {

                valido: false,

                motivo:
                    "O MEI pode contratar no máximo um empregado."

            };

        }


        /* -----------------------------
           OUTRA EMPRESA
        ----------------------------- */

        if (
            participaOutra === "SIM"
        ) {

            return {

                valido: false,

                motivo:
                    "O MEI não pode ser titular, sócio ou administrador de outra empresa."

            };

        }


        /* -----------------------------
           FILIAL
        ----------------------------- */

        if (
            possuiFilial === "SIM"
        ) {

            return {

                valido: false,

                motivo:
                    "O MEI não pode ter ou abrir filial."

            };

        }


        /* -----------------------------
           LIMITE
        ----------------------------- */

        const limite =
            calcularLimiteMei(
                categoria,
                mes
            );


        const faturamentoAnual =
            faturamentoMensal *
            12;


        /*
         * Aqui fazemos uma estimativa
         * anual usando o faturamento
         * mensal informado.
         */

        if (
            faturamentoAnual > limite
        ) {

            return {

                valido: false,

                motivo:
                    "O faturamento mensal informado, projetado para o período, ultrapassa o limite considerado para esse enquadramento MEI.",

                limite: limite

            };

        }


        return {

            valido: true,

            limite: limite,

            categoria: categoria

        };

    }


    /* =====================================================
       MOSTRAR / ESCONDER MEI
    ===================================================== */

    naturezaJuridica.addEventListener(
        "change",
        function () {

            if (
                this.value === "MEI"
            ) {

                areaMei.style.display =
                    "block";

            } else {

                areaMei.style.display =
                    "none";

            }

        }
    );


    /* =====================================================
       CÁLCULO DA EMPRESA
    ===================================================== */

    function calcularCusto(
        estadoSelecionado,
        naturezaSelecionada
    ) {

        if (
            !taxasRegistro[
                estadoSelecionado
            ]
        ) {

            return null;

        }


        const junta =
            taxasRegistro[
                estadoSelecionado
            ][
                naturezaSelecionada
            ];


        if (
            junta === null ||
            junta === undefined
        ) {

            return null;

        }


        const certificado =
            custosFixos.certificadoDigital;


        const servico =
            custosFixos.servicoAbertura;


        const total =
            junta +
            certificado +
            servico;


        return {

            junta: junta,

            certificado: certificado,

            servico: servico,

            total: total

        };

    }


    /* =====================================================
       SUBMIT
    ===================================================== */

    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const estadoSelecionado =
                estado.value;

            const naturezaSelecionada =
                naturezaJuridica.value;

            const atividadeSelecionada =
                atividade.value;

            const faturamentoMensal =
                converterValor(
                    faturamento.value
                );


            /* -----------------------------
               VALIDAÇÕES BÁSICAS
            ----------------------------- */

            if (!estadoSelecionado) {

                alert(
                    "Selecione o estado."
                );

                return;

            }


            if (!naturezaSelecionada) {

                alert(
                    "Selecione a natureza jurídica."
                );

                return;

            }


            if (!atividadeSelecionada) {

                alert(
                    "Selecione a atividade."
                );

                return;

            }


            if (
                !faturamentoMensal ||
                faturamentoMensal <= 0
            ) {

                alert(
                    "Informe um faturamento mensal válido."
                );

                return;

            }


            /* =================================================
               CASO MEI
            ================================================== */

            if (
                naturezaSelecionada === "MEI"
            ) {

                const verificacao =
                    verificarMei(
                        faturamentoMensal
                    );


                /* -------------------------
                   MEI NÃO COMPATÍVEL
                ------------------------- */

                if (
                    !verificacao.valido
                ) {

                    mostrarResultadoBase(
                        estadoSelecionado,
                        naturezaSelecionada,
                        atividadeSelecionada,
                        faturamentoMensal
                    );


                    valorResultado.textContent =
                        "Não elegível";


                    resultadoStatusLabel.textContent =
                        "VERIFICAÇÃO DO MEI";


                    resultadoMeiMensagem.style.display =
                        "flex";


                    resultadoMeiTitulo.textContent =
                        "Não foi possível considerar o enquadramento como MEI";


                    resultadoMeiTexto.textContent =
                        verificacao.motivo;


                    resultadoDetalhamento.style.display =
                        "none";


                    resultadoAlerta.style.display =
                        "block";


                    resultadoAlerta.textContent =
                        "O MEI possui regras específicas de atividade, faturamento, empregados, participação societária e filial.";


                    resultadoLimite.textContent =
                        verificacao.limite
                            ? formatarMoeda(
                                verificacao.limite
                            )
                            : "-";


                    resultado.style.display =
                        "block";


                    resultado.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });


                    return;

                }


                /* -------------------------
                   MEI COMPATÍVEL
                ------------------------- */

                mostrarResultadoBase(
                    estadoSelecionado,
                    naturezaSelecionada,
                    atividadeSelecionada,
                    faturamentoMensal
                );


                resultadoStatusLabel.textContent =
                    "FORMALIZAÇÃO MEI";


                valorResultado.textContent =
                    "Gratuito";


                resultadoMeiMensagem.style.display =
                    "flex";


                resultadoMeiTitulo.textContent =
                    "Informações compatíveis com o MEI";


                resultadoMeiTexto.textContent =
                    "Com as informações fornecidas, os principais critérios considerados pela calculadora são compatíveis com o enquadramento como MEI.";


                resultadoDetalhamento.style.display =
                    "block";


                resultadoJunta.textContent =
                    "Gratuito";


                resultadoCertificado.textContent =
                    "Não incluído";


                resultadoServico.textContent =
                    "Não incluído";


                resultadoAlerta.style.display =
                    "block";


                resultadoAlerta.textContent =
                    "A formalização do MEI é gratuita. O pagamento mensal do DAS-MEI é uma obrigação posterior à formalização e não está incluído neste cálculo.";


                resultadoLimite.textContent =
                    formatarMoeda(
                        verificacao.limite
                    );


                resultado.style.display =
                    "block";


                resultado.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });


                return;

            }


            /* =================================================
               DEMAIS NATUREZAS
            ================================================== */

            const porte =
                identificarPorte(
                    faturamentoMensal
                );


            const calculo =
                calcularCusto(
                    estadoSelecionado,
                    naturezaSelecionada
                );


            /* -------------------------
               TAXA NÃO CADASTRADA
            ------------------------- */

            if (!calculo) {

                mostrarResultadoBase(
                    estadoSelecionado,
                    naturezaSelecionada,
                    atividadeSelecionada,
                    faturamentoMensal
                );


                resultadoStatusLabel.textContent =
                    "TAXA A CONFIRMAR";


                valorResultado.textContent =
                    "Não disponível";


                resultadoMeiMensagem.style.display =
                    "none";


                resultadoDetalhamento.style.display =
                    "block";


                resultadoJunta.textContent =
                    "A confirmar";


                resultadoCertificado.textContent =
                    formatarMoeda(
                        custosFixos.certificadoDigital
                    );


                resultadoServico.textContent =
                    formatarMoeda(
                        custosFixos.servicoAbertura
                    );


                resultadoAlerta.style.display =
                    "block";


                resultadoAlerta.textContent =
                    "Ainda não temos a taxa oficial cadastrada para essa combinação de estado e natureza jurídica. Por isso, não vamos apresentar um total estimado com um valor não confirmado.";


                resultadoPorte.textContent =
                    porte;


                resultado.style.display =
                    "block";


                resultado.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });


                return;

            }


            /* -------------------------
               RESULTADO NORMAL
            ------------------------- */

            mostrarResultadoBase(
                estadoSelecionado,
                naturezaSelecionada,
                atividadeSelecionada,
                faturamentoMensal
            );


            resultadoStatusLabel.textContent =
                "ESTIMATIVA DE CUSTO";


            valorResultado.textContent =
                formatarMoeda(
                    calculo.total
                );


            resultadoMeiMensagem.style.display =
                "none";


            resultadoDetalhamento.style.display =
                "block";


            resultadoJunta.textContent =
                formatarCusto(
                    calculo.junta
                );


            resultadoCertificado.textContent =
                formatarCusto(
                    calculo.certificado
                );


            resultadoServico.textContent =
                formatarCusto(
                    calculo.servico
                );


            resultadoAlerta.style.display =
                "none";


            resultado.style.display =
                "block";


            resultado.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }
    );


    /* =====================================================
       PREENCHER DADOS DO RESULTADO
    ===================================================== */

    function mostrarResultadoBase(
        estadoSelecionado,
        naturezaSelecionada,
        atividadeSelecionada,
        faturamentoMensal
    ) {

        resultadoEstado.textContent =
            nomesEstados[
                estadoSelecionado
            ] || estadoSelecionado;


        resultadoNatureza.textContent =
            nomesNaturezas[
                naturezaSelecionada
            ] || naturezaSelecionada;


        resultadoAtividade.textContent =
            nomesAtividades[
                atividadeSelecionada
            ] || atividadeSelecionada;


        resultadoFaturamento.textContent =
            formatarMoeda(
                faturamentoMensal
            );


        if (
            naturezaSelecionada === "MEI"
        ) {

            resultadoPorte.textContent =
                "MEI";

        } else {

            resultadoPorte.textContent =
                identificarPorte(
                    faturamentoMensal
                );

        }

    }


    /* =====================================================
       NOVO CÁLCULO
       
       Mantém os campos preenchidos.
    ===================================================== */

    novoCalculo.addEventListener(
        "click",
        function () {

            resultado.style.display =
                "none";


            form.scrollIntoView({

                behavior: "smooth",

                block: "center"

            });

        }
    );

});