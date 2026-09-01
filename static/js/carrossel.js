document.addEventListener("DOMContentLoaded", function () {

    const track = document.querySelector(".servicos-track");
    const cards = document.querySelectorAll(".servico-card");

    const botaoAnterior = document.querySelector(".servico-anterior");
    const botaoProximo = document.querySelector(".servico-proximo");

    const indicadores = document.querySelectorAll(".indicador");


    // Verifica se os elementos existem
    if (
        !track ||
        cards.length === 0 ||
        !botaoAnterior ||
        !botaoProximo
    ) {
        console.error("Elementos do carrossel não encontrados.");
        return;
    }


    let paginaAtual = 0;


    // Quantidade de cards mostrados
    function cardsVisiveis() {

        if (window.innerWidth <= 700) {
            return 1;
        }

        if (window.innerWidth <= 1000) {
            return 2;
        }

        return 3;
    }


    // Quantidade total de páginas
    function totalPaginas() {

        return Math.ceil(
            cards.length / cardsVisiveis()
        );

    }


    // Atualiza o carrossel
    function atualizarCarrossel() {

        const quantidade = cardsVisiveis();

        const larguraCard = cards[0].getBoundingClientRect().width;

        const gap = 20;


        const deslocamento =
            paginaAtual *
            quantidade *
            (larguraCard + gap);


        track.style.transform =
            `translateX(-${deslocamento}px)`;


        // Indicadores
        indicadores.forEach(function (indicador, index) {

            indicador.classList.toggle(
                "ativo",
                index === paginaAtual
            );

        });


        // Botão anterior
        botaoAnterior.disabled =
            paginaAtual === 0;


        // Botão próximo
        botaoProximo.disabled =
            paginaAtual >= totalPaginas() - 1;

    }


    // =========================
    // BOTÃO PRÓXIMO
    // =========================

    botaoProximo.addEventListener("click", function () {

        if (paginaAtual < totalPaginas() - 1) {

            paginaAtual++;

            atualizarCarrossel();

        }

    });


    // =========================
    // BOTÃO ANTERIOR
    // =========================

    botaoAnterior.addEventListener("click", function () {

        if (paginaAtual > 0) {

            paginaAtual--;

            atualizarCarrossel();

        }

    });


    // =========================
    // INDICADORES
    // =========================

    indicadores.forEach(function (indicador, index) {

        indicador.addEventListener("click", function () {

            if (index < totalPaginas()) {

                paginaAtual = index;

                atualizarCarrossel();

            }

        });

    });


    // =========================
    // RESPONSIVIDADE
    // =========================

    window.addEventListener("resize", function () {

        const total = totalPaginas();


        if (paginaAtual >= total) {

            paginaAtual = total - 1;

        }


        atualizarCarrossel();

    });


    // =========================
    // INICIALIZAÇÃO
    // =========================

    atualizarCarrossel();

});