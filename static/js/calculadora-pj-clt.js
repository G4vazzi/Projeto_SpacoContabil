document.addEventListener("DOMContentLoaded", function () {

    console.log("Calculadora PJ x CLT carregada.");


    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const salarioCLT =
        document.getElementById("salario-clt");

    const vaVr =
        document.getElementById("va-vr");

    const vt =
        document.getElementById("vt");

    const planoSaude =
        document.getElementById("plano-saude");

    const outrosBeneficios =
        document.getElementById("outros-beneficios");


    const botaoCalcular =
        document.getElementById("btn-calcular-pj-clt");

    const resultado =
        document.getElementById("resultado-pj-clt");

    const novoCalculo =
        document.getElementById("novo-calculo-pj-clt");


    /* =====================================================
       RESULTADO CLT
    ===================================================== */

    const resultadoCLTBruto =
        document.getElementById("resultado-clt-bruto");

    const resultadoCLTDescontos =
        document.getElementById("resultado-clt-descontos");

    const resultadoCLTObrigatorios =
        document.getElementById("resultado-clt-obrigatorios");

    const resultadoCLTOutros =
        document.getElementById("resultado-clt-outros");

    const resultadoCLTEquivalente =
        document.getElementById("resultado-clt-equivalente");


    /* =====================================================
       RESULTADO PJ
    ===================================================== */

    const resultadoPJBruto =
        document.getElementById("resultado-pj-bruto");

    const resultadoPJDescontos =
        document.getElementById("resultado-pj-descontos");

    const resultadoPJEquivalente =
        document.getElementById("resultado-pj-equivalente");

    const resultadoPJNecessario =
        document.getElementById("resultado-pj-necessario");

    const resultadoPercentual =
        document.getElementById("resultado-percentual");


    /* =====================================================
       VERIFICAÇÃO
    ===================================================== */

    if (
        !salarioCLT ||
        !vaVr ||
        !vt ||
        !planoSaude ||
        !outrosBeneficios ||
        !botaoCalcular ||
        !resultado
    ) {

        console.error(
            "Calculadora PJ x CLT: algum elemento do HTML não foi encontrado."
        );

        return;

    }


    /* =====================================================
       CONFIGURAÇÃO DA SIMULAÇÃO PJ
       
       Estes valores ficam internos para que o usuário
       não precise conhecer detalhes tributários.
    ===================================================== */

    const CONFIG_PJ = {

        aliquotaImposto: 0.06,

        prolabore: 1621.00,

        aliquotaINSS: 0.11

    };


    /* =====================================================
       FORMATAR MOEDA
    ===================================================== */

    function formatarMoeda(valor) {

        return Number(valor).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }


    /* =====================================================
       CONVERTER VALOR
       
       Exemplos:
       
       R$ 1.621,00 -> 1621
       R$ 5.000,00 -> 5000
       1.621,00    -> 1621
    ===================================================== */

    function converterValor(valor) {

        if (
            valor === null ||
            valor === undefined ||
            valor === ""
        ) {

            return 0;

        }


        let texto =
            String(valor)
                .trim()
                .replace(/R\$/gi, "")
                .replace(/\s/g, "");


        if (!texto) {

            return 0;

        }


        /*
         * Se tiver vírgula, trata como número brasileiro.
         */

        if (texto.includes(",")) {

            texto =
                texto
                    .replace(/\./g, "")
                    .replace(",", ".");

        }


        /*
         * Caso tenha somente números e ponto decimal.
         */

        const numero =
            Number(texto);


        return Number.isFinite(numero)
            ? numero
            : 0;

    }


    /* =====================================================
       MÁSCARA DE MOEDA
       
       O usuário pode digitar normalmente:
       
       1621
       5000
       10000
       
       Ao sair do campo, será formatado.
    ===================================================== */

    function aplicarMascaraMoeda(campo) {

        if (!campo) {

            return;

        }


        campo.addEventListener(
            "input",
            function () {

                /*
                 * Mantém somente números enquanto o usuário
                 * está digitando.
                 */
                this.value =
                    this.value.replace(/\D/g, "");

            }
        );


        campo.addEventListener(
            "focus",
            function () {

                /*
                 * Retira a formatação para facilitar
                 * alteração do valor.
                 */
                const valor =
                    converterValor(this.value);


                if (valor > 0) {

                    this.value =
                        String(
                            valor
                        ).replace(".", ",");

                }

            }
        );


        campo.addEventListener(
            "blur",
            function () {

                const valor =
                    converterValor(this.value);


                if (valor > 0) {

                    this.value =
                        formatarMoeda(valor);

                }
                else {

                    this.value = "";

                }

            }
        );

    }


    aplicarMascaraMoeda(salarioCLT);
    aplicarMascaraMoeda(vaVr);
    aplicarMascaraMoeda(vt);
    aplicarMascaraMoeda(planoSaude);
    aplicarMascaraMoeda(outrosBeneficios);


    /* =====================================================
       INSS CLT 2026
    ===================================================== */

    function calcularINSSCLT(
        salario
    ) {

        const teto =
            8475.55;


        const base =
            Math.min(
                Math.max(
                    salario,
                    0
                ),
                teto
            );


        let inss = 0;


        if (
            base <= 1621.00
        ) {

            inss =
                base * 0.075;

        }


        else if (
            base <= 2902.84
        ) {

            inss =
                (1621.00 * 0.075) +

                (
                    (base - 1621.00) *
                    0.09
                );

        }


        else if (
            base <= 4354.27
        ) {

            inss =
                (1621.00 * 0.075) +

                (
                    (2902.84 - 1621.00) *
                    0.09
                ) +

                (
                    (base - 2902.84) *
                    0.12
                );

        }


        else {

            inss =
                (1621.00 * 0.075) +

                (
                    (2902.84 - 1621.00) *
                    0.09
                ) +

                (
                    (4354.27 - 2902.84) *
                    0.12
                ) +

                (
                    (base - 4354.27) *
                    0.14
                );

        }


        return inss;

    }


    /* =====================================================
       IRRF 2026
    ===================================================== */

    function calcularIRRF(
        salario,
        inss
    ) {

        /*
         * Desconto simplificado mensal.
         */

        const descontoSimplificado =
            607.20;


        const deducao =
            Math.max(
                inss,
                descontoSimplificado
            );


        const base =
            Math.max(
                0,
                salario - deducao
            );


        let imposto = 0;


        if (
            base <= 2428.80
        ) {

            imposto = 0;

        }


        else if (
            base <= 2826.65
        ) {

            imposto =
                (
                    base * 0.075
                ) -
                182.16;

        }


        else if (
            base <= 3751.05
        ) {

            imposto =
                (
                    base * 0.15
                ) -
                394.16;

        }


        else if (
            base <= 4664.68
        ) {

            imposto =
                (
                    base * 0.225
                ) -
                675.49;

        }


        else {

            imposto =
                (
                    base * 0.275
                ) -
                908.73;

        }


        imposto =
            Math.max(
                0,
                imposto
            );


        /*
         * Redução do IRPF em 2026.
         */

        let reducao = 0;


        if (
            salario <= 5000
        ) {

            reducao =
                imposto;

        }


        else if (
            salario <= 7350
        ) {

            reducao =
                978.62 -
                (
                    0.133145 *
                    salario
                );


            reducao =
                Math.max(
                    0,
                    reducao
                );

        }


        return Math.max(
            0,
            imposto - reducao
        );

    }


    /* =====================================================
       13º SALÁRIO
       
       Transformado em equivalente mensal.
    ===================================================== */

    function calcular13Mensal(
        salarioLiquido
    ) {

        return (
            salarioLiquido / 12
        );

    }


    /* =====================================================
       FÉRIAS + 1/3
       
       Transformado em equivalente mensal.
    ===================================================== */

    function calcularFeriasMensal(
        salario
    ) {

        const valorBruto =
            salario *
            (4 / 3);


        const inss =
            calcularINSSCLT(
                valorBruto
            );


        const irrf =
            calcularIRRF(
                valorBruto,
                inss
            );


        const valorLiquido =
            Math.max(
                0,
                valorBruto -
                inss -
                irrf
            );


        return (
            valorLiquido / 12
        );

    }


    /* =====================================================
       FGTS
    ===================================================== */

    function calcularFGTS(
        salario
    ) {

        return (
            salario * 0.08
        );

    }


    /* =====================================================
       CALCULAR
    ===================================================== */

    function calcular() {

        console.log(
            "Iniciando cálculo..."
        );


        /* =================================================
           LER CAMPOS
        ================================================== */

        const salario =
            converterValor(
                salarioCLT.value
            );


        const valorVA =
            converterValor(
                vaVr.value
            );


        const valorVT =
            converterValor(
                vt.value
            );


        const valorPlano =
            converterValor(
                planoSaude.value
            );


        const valorOutros =
            converterValor(
                outrosBeneficios.value
            );


        /* =================================================
           VALIDAÇÃO
        ================================================== */

        if (
            salario <= 0
        ) {

            alert(
                "Informe seu salário mensal bruto."
            );

            salarioCLT.focus();

            return;

        }


        /* =================================================
           INSS CLT
        ================================================== */

        const inssCLT =
            calcularINSSCLT(
                salario
            );


        /* =================================================
           IRRF CLT
        ================================================== */

        const irrfCLT =
            calcularIRRF(
                salario,
                inssCLT
            );


        /* =================================================
           TOTAL DESCONTOS
        ================================================== */

        const descontosCLT =
            inssCLT +
            irrfCLT;


        /* =================================================
           SALÁRIO LÍQUIDO
        ================================================== */

        const salarioLiquido =
            Math.max(
                0,
                salario -
                descontosCLT
            );


        /* =================================================
           BENEFÍCIOS
        ================================================== */

        const totalBeneficios =
            valorVA +
            valorVT +
            valorPlano +
            valorOutros;


        /* =================================================
           DIREITOS CLT
        ================================================== */

        const decimoTerceiro =
            calcular13Mensal(
                salarioLiquido
            );


        const ferias =
            calcularFeriasMensal(
                salario
            );


        const fgts =
            calcularFGTS(
                salario
            );


        const direitosCLT =
            decimoTerceiro +
            ferias +
            fgts;


        /* =================================================
           VALOR MENSAL EQUIVALENTE CLT
        ================================================== */

        const valorEquivalenteCLT =
            salarioLiquido +
            direitosCLT +
            totalBeneficios;


        /* =================================================
           INSS PRÓ-LABORE
        ================================================== */

        const inssProlabore =
            CONFIG_PJ.prolabore *
            CONFIG_PJ.aliquotaINSS;


        /* =================================================
           FATOR LÍQUIDO PJ
        ================================================== */

        const fatorLiquidoPJ =
            1 -
            CONFIG_PJ.aliquotaImposto;


        /* =================================================
           FATURAMENTO PJ NECESSÁRIO
        ================================================== */

        const faturamentoPJ =
            (
                valorEquivalenteCLT +
                inssProlabore
            ) /
            fatorLiquidoPJ;


        /* =================================================
           IMPOSTO PJ
        ================================================== */

        const impostoPJ =
            faturamentoPJ *
            CONFIG_PJ.aliquotaImposto;


        /* =================================================
           DESCONTOS PJ
        ================================================== */

        const descontosPJ =
            impostoPJ +
            inssProlabore;


        /* =================================================
           VALOR DISPONÍVEL PJ
        ================================================== */

        const valorDisponivelPJ =
            faturamentoPJ -
            descontosPJ;


        /* =================================================
           DIFERENÇA PERCENTUAL
        ================================================== */

        const percentual =
            (
                (
                    faturamentoPJ /
                    salario
                ) - 1
            ) * 100;


        /* =================================================
           RESULTADO CLT
        ================================================== */

        resultadoCLTBruto.textContent =
            formatarMoeda(
                salario
            );


        resultadoCLTDescontos.textContent =
            formatarMoeda(
                descontosCLT
            );


        resultadoCLTObrigatorios.textContent =
            formatarMoeda(
                direitosCLT
            );


        resultadoCLTOutros.textContent =
            formatarMoeda(
                totalBeneficios
            );


        resultadoCLTEquivalente.textContent =
            formatarMoeda(
                valorEquivalenteCLT
            );


        /* =================================================
           RESULTADO PJ
        ================================================== */

        resultadoPJBruto.textContent =
            formatarMoeda(
                faturamentoPJ
            );


        resultadoPJDescontos.textContent =
            formatarMoeda(
                descontosPJ
            );


        resultadoPJEquivalente.textContent =
            formatarMoeda(
                valorDisponivelPJ
            );


        resultadoPJNecessario.textContent =
            formatarMoeda(
                faturamentoPJ
            );


        resultadoPercentual.textContent =
            `${percentual
                .toFixed(1)
                .replace(".", ",")}%`;


        /* =================================================
           MOSTRAR RESULTADO
        ================================================== */

        resultado.style.display =
            "block";


        resultado.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


        console.log(
            "Cálculo concluído.",
            {
                salario,
                inssCLT,
                irrfCLT,
                salarioLiquido,
                direitosCLT,
                totalBeneficios,
                valorEquivalenteCLT,
                faturamentoPJ,
                descontosPJ,
                valorDisponivelPJ
            }
        );

    }


    /* =====================================================
       BOTÃO CALCULAR
    ===================================================== */

    botaoCalcular.addEventListener(
        "click",
        function () {

            calcular();

        }
    );


    /* =====================================================
       REFAZER CÁLCULO
    ===================================================== */

    if (novoCalculo) {

        novoCalculo.addEventListener(
            "click",
            function () {

                resultado.style.display =
                    "none";


                formataCamposNovamente();


                salarioCLT.focus();


                window.scrollTo({

                    top:
                        salarioCLT.getBoundingClientRect().top +
                        window.scrollY -
                        150,

                    behavior: "smooth"

                });

            }
        );

    }


    /* =====================================================
       REFORMATAR CAMPOS
    ===================================================== */

    function formataCamposNovamente() {

        const campos = [
            salarioCLT,
            vaVr,
            vt,
            planoSaude,
            outrosBeneficios
        ];


        campos.forEach(
            function (campo) {

                if (!campo) {
                    return;
                }


                const valor =
                    converterValor(
                        campo.value
                    );


                if (valor > 0) {

                    campo.value =
                        formatarMoeda(
                            valor
                        );

                }

            }
        );

    }


})