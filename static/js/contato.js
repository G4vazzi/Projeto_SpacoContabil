
document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       ELEMENTOS
    ========================================= */

    const overlay = document.getElementById(
        "spc-contato-overlay"
    );

    const modal = overlay?.querySelector(
        ".spc-contato-modal"
    );

    const botaoFechar = document.getElementById(
        "spc-contato-fechar"
    );

    const form = document.getElementById(
        "spc-contato-form"
    );

    const status = document.getElementById(
        "spc-contato-status"
    );

    const botaoEnviar = document.getElementById(
        "spc-contato-enviar"
    );

    const telefone = document.getElementById(
        "spc-telefone"
    );

    if (!overlay || !modal || !form) {
        return;
    }

    let ultimoFoco = null;


    /* =========================================
       ABRIR
    ========================================= */

    function abrirContato(evento) {

        evento?.preventDefault();

        ultimoFoco = document.activeElement;

        overlay.hidden = false;

        document.body.classList.add(
            "spc-modal-aberto"
        );

        document.getElementById(
            "spc-nome"
        ).focus();

    }


    /* =========================================
       FECHAR
    ========================================= */

    function fecharContato() {

        overlay.hidden = true;

        document.body.classList.remove(
            "spc-modal-aberto"
        );

        if (ultimoFoco) {
            ultimoFoco.focus();
        }

    }


    /* =========================================
       BOTÕES QUE ABREM O FORMULÁRIO
    ========================================= */

    document.querySelectorAll(
        "[data-abrir-contato]"
    ).forEach(botao => {

        botao.addEventListener(
            "click",
            abrirContato
        );

    });


    /* =========================================
       BOTÃO FECHAR
    ========================================= */

    botaoFechar.addEventListener(
        "click",
        fecharContato
    );


    /* =========================================
       CLICAR FORA DA JANELA
    ========================================= */

    overlay.addEventListener("click", evento => {

        if (evento.target === overlay) {
            fecharContato();
        }

    });


    /* =========================================
       TECLA ESC / FOCO
    ========================================= */

    document.addEventListener("keydown", evento => {

        if (overlay.hidden) {
            return;
        }

        if (evento.key === "Escape") {
            fecharContato();
            return;
        }

        if (evento.key === "Tab") {

            const elementos = Array.from(
                modal.querySelectorAll(
                    'button:not(:disabled), input:not(:disabled):not([tabindex="-1"]), a[href]'
                )
            ).filter(elemento => elemento.getClientRects().length);

            if (!elementos.length) {
                return;
            }

            const primeiro = elementos[0];

            const ultimo = elementos[
                elementos.length - 1
            ];

            if (
                evento.shiftKey &&
                document.activeElement === primeiro
            ) {
                evento.preventDefault();
                ultimo.focus();
            }

            else if (
                !evento.shiftKey &&
                document.activeElement === ultimo
            ) {
                evento.preventDefault();
                primeiro.focus();
            }

        }

    });


    /* =========================================
       MÁSCARA DE TELEFONE
    ========================================= */

    telefone.addEventListener("input", () => {

        let numeros = telefone.value
            .replace(/\D/g, "")
            .slice(0, 11);

        if (numeros.length > 2) {

            numeros =
                "(" +
                numeros.slice(0, 2) +
                ") " +
                numeros.slice(2);

        }

        telefone.value = numeros;

    });


    /* =========================================
       ENVIAR FORMULÁRIO
    ========================================= */

    form.addEventListener("submit", async evento => {

        evento.preventDefault();

        status.textContent = "";

        const nome = document.getElementById(
            "spc-nome"
        ).value.trim();

        const email = document.getElementById(
            "spc-email"
        ).value.trim();

        const numero = telefone.value
            .replace(/\D/g, "");

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        if (numero.length !== 10 && numero.length !== 11) {

            status.textContent =
                "Informe um telefone válido com DDD.";

            telefone.focus();

            return;
        }

        const dados = {

            nome: nome,

            telefone: numero,

            email: email,

            aceite: document.getElementById(
                "spc-aceite"
            ).checked,

            website: document.getElementById(
                "spc-empresa-web"
            ).value

        };

        botaoEnviar.disabled = true;

        botaoEnviar.textContent =
            "Enviando...";

        try {

            const resposta = await fetch(
                "/api/contato",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(dados)
                }
            );

            const resultado = await resposta.json();

            if (!resposta.ok || !resultado.ok) {

                throw new Error(
                    resultado.erro ||
                    "Não foi possível enviar a solicitação."
                );

            }

            status.style.color = "#177245";

            status.textContent =
                "Solicitação registrada com sucesso!";

            form.reset();

        }

        catch (erro) {

            status.style.color = "#B42318";

            status.textContent =
                "Não foi possível registrar sua solicitação. " +
                "Tente novamente mais tarde.";

            console.error(erro);

        }

        finally {

            botaoEnviar.disabled = false;

            botaoEnviar.textContent =
                "Solicitar contato";

        }

    });

});
