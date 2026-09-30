document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       CONFIGURAÇÃO
       Regras vigentes durante 2026
    ===================================================== */

    const CONFIG = {

        anoRegras: 2026,

        limiteFatorR: 0.28

    };


    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const atividade =
        document.getElementById("fatorr-atividade");

    const tempo =
        document.getElementById("fatorr-tempo");

    const receita =
        document.getElementById("fatorr-receita");

    const salarios =
        document.getElementById("fatorr-salarios");

    const prolabore =
        document.getElementById("fatorr-prolabore");

    const fgts =
        document.getElementById("fatorr-fgts");

    const cpp =
        document.getElementById("fatorr-cpp");


    const botao =
        document.getElementById("fatorr-calcular");

    const novoCalculo =
        document.getElementById("fatorr-novo-calculo");


    /* =====================================================
       PERÍODO
    ===================================================== */

    const periodoInfo =
        document.getElementById("fatorr-periodo-info");

    const periodoTitulo =
        document.getElementById("fatorr-periodo-titulo");

    const periodoTexto =
        document.getElementById("fatorr-periodo-texto");

    const labelReceita =
        document.getElementById("fatorr-label-receita");


    /* =====================================================
       RESULTADO
    ===================================================== */

    const resultado =
        document.getElementById("fatorr-resultado");

    const resultadoReceita =
        document.getElementById("fatorr-resultado-receita");

    const resultadoFolha =
        document.getElementById("fatorr-resultado-folha");

    const percentual =
        document.getElementById("fatorr-percentual");

    const situacao =
        document.getElementById("fatorr-situacao");


    /* =====================================================
       BARRA
    ===================================================== */

    const barra =
        document.getElementById(
            "fatorr-barra-preenchimento"
        );

    const marcador =
        document.getElementById(
            "fatorr-marcador"
        );


    /* =====================================================
       ANEXO
    ===================================================== */

    const anexoBox =
        document.getElementById(
            "fatorr-anexo-box"
        );

    const anexo =
        document.getElementById(
            "fatorr-anexo"
        );

    const anexoTexto =
        document.getElementById(
            "fatorr-anexo-texto"
        );


    /* =====================================================
       META
    ===================================================== */

    const metaAtual =
        document.getElementById(
            "fatorr-meta-atual"
        );

    const metaNecessaria =
        document.getElementById(
            "fatorr-meta-necessaria"
        );

    const metaDiferenca =
        document.getElementById(
            "fatorr-meta-diferenca"
        );

    const diferencaLabel =
        document.getElementById(
            "fatorr-diferenca-label"
        );


    /* =====================================================
       COMPOSIÇÃO
    ===================================================== */

    const compSalarios =
        document.getElementById(
            "fatorr-comp-salarios"
        );

    const compProlabore =
        document.getElementById(
            "fatorr-comp-prolabore"
        );

    const compFgts =
        document.getElementById(
            "fatorr-comp-fgts"
        );

    const compCpp =
        document.getElementById(
            "fatorr-comp-cpp"
        );

    const compTotal =
        document.getElementById(
            "fatorr-comp-total"
        );


    const alertaAtividade =
        document.getElementById(
            "fatorr-alerta-atividade"
        );


    /* =====================================================
       VERIFICAÇÃO
    ===================================================== */

    if (
        !atividade ||
        !tempo ||
        !receita ||
        !salarios ||
        !prolabore ||
        !fgts ||
        !cpp ||
        !botao ||
        !resultado
    ) {

        console.error(
            "Calculadora Fator R: elementos não encontrados."
        );

        return;

    }


    /* =====================================================
       MOEDA
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


    function converterMoeda(valor) {

        if (!valor) {

            return 0;

        }


        let texto =
            String(valor)
                .replace(/R\$/g, "")
                .replace(/\s/g, "")
                .replace(/\./g, "")
                .replace(",", ".");


        const numero =
            parseFloat(texto);


        return Number.isFinite(numero)
            ? numero
            : 0;

    }


    /* =====================================================
       MÁSCARA DE MOEDA
    ===================================================== */

    function aplicarMascara(campo) {

        campo.addEventListener(
            "input",
            function () {

                const numeros =
                    this.value.replace(
                        /\D/g,
                        ""
                    );


                if (!numeros) {

                    this.value = "";

                    return;

                }


                const valor =
                    Number(numeros) / 100;


                this.value =
                    formatarMoeda(valor);

            }
        );

    }


    aplicarMascara(receita);
    aplicarMascara(salarios);
    aplicarMascara(prolabore);
    aplicarMascara(fgts);
    aplicarMascara(cpp);


    /* =====================================================
       PERÍODO
    ===================================================== */

    tempo.addEventListener(
        "change",
        atualizarPeriodo
    );


    function atualizarPeriodo() {

        const mesAtividade =
            Number(tempo.value);


        if (!mesAtividade) {

            periodoInfo.style.display =
                "none";

            return;

        }


        periodoInfo.style.display =
            "flex";


        /* =================================================
           MÊS DE ABERTURA
        ================================================== */

        if (mesAtividade === 1) {

            periodoTitulo.textContent =
                "Mês de início das atividades";

            periodoTexto.textContent =
                "Para o mês de abertura, informe a receita bruta e a folha do próprio período de apuração.";

            labelReceita.textContent =
                "Receita bruta do mês de abertura";

            return;

        }


        /* =================================================
           DO 2º AO 12º MÊS
        ================================================== */

        if (mesAtividade >= 2 &&
            mesAtividade <= 12) {

            const mesesAnteriores =
                mesAtividade - 1;


            periodoTitulo.textContent =
                `${mesAtividade}º mês de atividade`;


            periodoTexto.textContent =
                `Informe a receita e a folha acumuladas nos ${mesesAnteriores} mês(es) anteriores ao período de apuração. A calculadora aplicará a regra correspondente às empresas com menos de 13 meses de atividade.`;


            labelReceita.textContent =
                `Receita acumulada dos ${mesesAnteriores} mês(es) anteriores`;


            return;

        }


        /* =================================================
           13º MÊS OU MAIS
        ================================================== */

        periodoTitulo.textContent =
            "Empresa com histórico de 12 meses";


        periodoTexto.textContent =
            "Informe a receita bruta e a folha correspondentes aos 12 meses anteriores ao período de apuração.";


        labelReceita.textContent =
            "Receita bruta dos últimos 12 meses";

    }


    /* =====================================================
       FOLHA
    ===================================================== */

    function calcularFolha() {

        const valorSalarios =
            converterMoeda(
                salarios.value
            );

        const valorProlabore =
            converterMoeda(
                prolabore.value
            );

        const valorFgts =
            converterMoeda(
                fgts.value
            );

        const valorCpp =
            converterMoeda(
                cpp.value
            );


        return {

            salarios: valorSalarios,

            prolabore: valorProlabore,

            fgts: valorFgts,

            cpp: valorCpp,

            total:
                valorSalarios +
                valorProlabore +
                valorFgts +
                valorCpp

        };

    }


    /* =====================================================
       REGRA FATOR R - 2026
    ===================================================== */

    function calcularFatorR(
        folha,
        receitaBruta,
        mesAtividade
    ) {


        /* =================================================
           MÊS DE ABERTURA
        ================================================== */

        if (mesAtividade === 1) {


            /* Folha > 0 e Receita = 0 */

            if (
                folha > 0 &&
                receitaBruta === 0
            ) {

                return {

                    fator: 0.28,

                    regra:
                        "No mês de abertura, quando existe folha e não existe receita, o Fator R é considerado 28%."

                };

            }


            /* Folha = 0 e Receita > 0 */

            if (
                folha === 0 &&
                receitaBruta > 0
            ) {

                return {

                    fator: 0.01,

                    regra:
                        "No mês de abertura, quando não existe folha e existe receita, o Fator R é considerado 1%."

                };

            }


            /* Folha > 0 e Receita > 0 */

            if (
                folha > 0 &&
                receitaBruta > 0
            ) {

                return {

                    fator:
                        folha /
                        receitaBruta,

                    regra:
                        "Fator R calculado pela relação entre folha e receita do período de apuração."

                };

            }


            /* Ambos iguais a zero */

            return {

                fator: null,

                regra:
                    "Não é possível calcular automaticamente quando folha e receita do mês de abertura são iguais a zero."

            };

        }


        /* =================================================
           PERÍODOS POSTERIORES
        ================================================== */


        /* FS12 = 0 e RBT12 = 0 */

        if (
            folha === 0 &&
            receitaBruta === 0
        ) {

            return {

                fator: 0.01,

                regra:
                    "Como a folha e a receita consideradas são iguais a zero, o Fator R é considerado 1%."

            };

        }


        /* FS12 > 0 e RBT12 = 0 */

        if (
            folha > 0 &&
            receitaBruta === 0
        ) {

            return {

                fator: 0.28,

                regra:
                    "Como existe folha e a receita considerada é igual a zero, o Fator R é considerado 28%."

            };

        }


        /* FS12 = 0 e RBT12 > 0 */

        if (
            folha === 0 &&
            receitaBruta > 0
        ) {

            return {

                fator: 0.01,

                regra:
                    "Como não existe folha e existe receita, o Fator R é considerado 1%."

            };

        }


        /* Ambos maiores que zero */

        return {

            fator:
                folha /
                receitaBruta,

            regra:
                "Fator R calculado pela relação entre a folha e a receita do período considerado."

        };

    }


    /* =====================================================
       CALCULAR
    ===================================================== */

    function calcular() {


        /* =================================================
           VALIDAÇÃO
        ================================================== */

        if (!atividade.value) {

            alert(
                "Selecione a atividade da empresa."
            );

            atividade.focus();

            return;

        }


        if (!tempo.value) {

            alert(
                "Informe o período de atividade da empresa."
            );

            tempo.focus();

            return;

        }


        const mesAtividade =
            Number(tempo.value);


        const valorReceita =
            converterMoeda(
                receita.value
            );


        const folha =
            calcularFolha();


        /* =================================================
           CÁLCULO
        ================================================== */

        const calculo =
            calcularFatorR(
                folha.total,
                valorReceita,
                mesAtividade
            );


        if (calculo.fator === null) {

            alert(calculo.regra);

            return;

        }


        const fator =
            calculo.fator;


        const fatorPercentual =
            fator * 100;


        /* =================================================
           RESULTADO
        ================================================== */

        resultadoReceita.textContent =
            formatarMoeda(
                valorReceita
            );


        resultadoFolha.textContent =
            formatarMoeda(
                folha.total
            );


        percentual.textContent =
            fatorPercentual
                .toFixed(2)
                .replace(".", ",") +
            "%";


        /* =================================================
           ANEXO
        ================================================== */

        if (
            fator >=
            CONFIG.limiteFatorR
        ) {

            situacao.textContent =
                "Fator R igual ou superior a 28%";


            anexo.textContent =
                "ANEXO III";


            anexoTexto.textContent =
                "Para atividades sujeitas ao Fator R, este resultado direciona a tributação ao Anexo III.";


            anexoBox.classList.remove(
                "fatorr-anexo-v"
            );


            anexoBox.classList.add(
                "fatorr-anexo-iii"
            );

        }

        else {

            situacao.textContent =
                "Fator R inferior a 28%";


            anexo.textContent =
                "ANEXO V";


            anexoTexto.textContent =
                "Para atividades sujeitas ao Fator R, este resultado direciona a tributação ao Anexo V.";


            anexoBox.classList.remove(
                "fatorr-anexo-iii"
            );


            anexoBox.classList.add(
                "fatorr-anexo-v"
            );

        }


        /* =================================================
           META DE 28%
        ================================================== */

        const folhaNecessaria =
            valorReceita *
            CONFIG.limiteFatorR;


        const diferenca =
            folha.total -
            folhaNecessaria;


        metaAtual.textContent =
            formatarMoeda(
                folha.total
            );


        metaNecessaria.textContent =
            formatarMoeda(
                folhaNecessaria
            );


        metaDiferenca.textContent =
            formatarMoeda(
                Math.abs(diferenca)
            );


        if (diferenca >= 0) {

            diferencaLabel.textContent =
                "Margem acima de 28%";

        }

        else {

            diferencaLabel.textContent =
                "Diferença até 28%";

        }


        /* =================================================
           COMPOSIÇÃO
        ================================================== */

        compSalarios.textContent =
            formatarMoeda(
                folha.salarios
            );


        compProlabore.textContent =
            formatarMoeda(
                folha.prolabore
            );


        compFgts.textContent =
            formatarMoeda(
                folha.fgts
            );


        compCpp.textContent =
            formatarMoeda(
                folha.cpp
            );


        compTotal.textContent =
            formatarMoeda(
                folha.total
            );


        /* =================================================
           BARRA VISUAL
        ================================================== */

        let posicao =
            (
                fatorPercentual /
                50
            ) *
            100;


        posicao =
            Math.min(
                Math.max(
                    posicao,
                    0
                ),
                100
            );


        barra.style.width =
            posicao + "%";


        marcador.style.left =
            posicao + "%";


        /* =================================================
           ATIVIDADE
        ================================================== */

        if (
            atividade.value ===
            "nao-sei"
        ) {

            alertaAtividade.style.display =
                "flex";

        }

        else {

            alertaAtividade.style.display =
                "none";

        }


        /* =================================================
           MOSTRAR RESULTADO
        ================================================== */

        resultado.style.display =
            "block";


        resultado.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }


    /* =====================================================
       EVENTOS
    ===================================================== */

    botao.addEventListener(
        "click",
        calcular
    );


    novoCalculo.addEventListener(
        "click",
        function () {

            resultado.style.display =
                "none";


            document
                .querySelector(
                    ".fatorr-box"
                )
                .scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });

        }
    );

});