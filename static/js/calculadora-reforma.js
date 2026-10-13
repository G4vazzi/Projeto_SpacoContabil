/* Calculadora da Reforma Tributária do Consumo — cenário ilustrativo, base 2026. */
(function (global) {
  'use strict';

  const SHARE_ISS = {2026: 1, 2027: 1, 2028: 1, 2029: .9, 2030: .8, 2031: .7, 2032: .6, 2033: 0};
  const SHARE_IBS = {2029: .1, 2030: .2, 2031: .3, 2032: .4, 2033: 1};
  const round = v => Math.round((v + Number.EPSILON) * 100) / 100;

  function simularRTC(v) {
    const {ano, receita, operacao, pis, local, creditoPis, creditoIcms, compras, cbs, ibs} = v;
    if (!Number.isInteger(ano) || ano < 2026 || ano > 2033) throw new Error('Ano inválido.');
    for (const [nome, valor] of Object.entries({receita,pis,local,creditoPis,creditoIcms,compras})) {
      if (!Number.isFinite(valor) || valor < 0) throw new Error('Valor inválido: ' + nome);
    }
    if (receita <= 0) throw new Error('Informe receita maior que zero.');
    if (compras > receita) throw new Error('As aquisições não podem superar a receita nesta simulação simplificada.');
    if (pis > 100 || local > 100) throw new Error('Alíquota atual inválida.');
    if (operacao !== 'servicos' && operacao !== 'mercadorias') throw new Error('Tipo de operação inválido.');
    const icmsCredito = operacao === 'mercadorias' ? creditoIcms : 0;
    const pisBruto = receita * pis / 100;
    const localBruto = receita * local / 100;
    if (creditoPis > pisBruto || icmsCredito > localBruto) {
      throw new Error('Os créditos atuais não podem ultrapassar o respectivo débito bruto nesta versão simplificada.');
    }
    const basePisLiquida = pisBruto - creditoPis;
    const baseLocalLiquida = localBruto - icmsCredito;
    const atual = round(basePisLiquida + baseLocalLiquida);
    const shares = {legado: SHARE_ISS[ano], ibsTransicao: SHARE_IBS[ano] ?? 0};
    if (ano === 2026) {
      return {
        ano, atual, futuro: atual, diferenca: 0,
        pisValor: round(basePisLiquida), localValor: round(baseLocalLiquida),
        cbsValor: 0, ibsValor: 0,
        testeCBS: round(receita * .009), testeIBS: round(receita * .001),
        cbsAliquota: .9, ibsAliquota: .1,
        anoTeste: true, shares
      };
    }
    if (!Number.isFinite(cbs) || cbs <= .1 || cbs > 100) {
      throw new Error('Informe uma alíquota integral de CBS maior que 0,1% e de até 100%.');
    }
    if (ano >= 2029 && (!Number.isFinite(ibs) || ibs <= 0 || ibs > 100)) {
      throw new Error('Informe uma hipótese de alíquota integral de IBS maior que zero e de até 100%.');
    }
    const cbsEfetiva = ano === 2027 || ano === 2028 ? cbs - .1 : cbs;
    const ibsEfetiva = ano === 2027 || ano === 2028 ? .1 : ibs * shares.ibsTransicao;
    // Hipótese: todos os insumos informados dão direito a crédito na mesma proporção da saída.
    const cbsValor = Math.max(0, round((receita - compras) * cbsEfetiva / 100));
    const ibsValor = Math.max(0, round((receita - compras) * ibsEfetiva / 100));
    const localValor = round(baseLocalLiquida * shares.legado);
    const pisValor = 0;
    const futuro = round(cbsValor + ibsValor + localValor);
    return {
      ano, atual, futuro, diferenca: round(futuro - atual), pisValor,
      localValor, cbsValor, ibsValor, anoTeste: false, shares,
      cbsAliquota: cbsEfetiva, ibsAliquota: ibsEfetiva
    };
  }

  // Disponível em Node.js para executar testes automatizados.
  if (typeof module !== 'undefined' && module.exports) module.exports = {simularRTC};
  if (!global || !global.document) return;

  const $ = id => global.document.getElementById(id);
  const parseBR = (s) => {
    if (s == null || String(s).trim() === '') return 0;
    const str = String(s).trim().replace(/\s|R\$|%/g, '');
    const number = str.includes(',') ? Number(str.replace(/\./g, '').replace(',', '.')) : Number(str);
    return Number.isFinite(number) ? number : NaN;
  };
  const moeda = n => Number(n).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
  const porcento = n => Number(n).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) + '%';

  function iniciar() {
    const form = $('rtc-calcular');
    if (!form) return;
    const ocultarResultado = () => { $('rtc-resultado').hidden = true; };
    const estado = $('rtc-operacao');
    const grupoIcms = $('rtc-grupo-icms');
    const localInput = $('rtc-local');
    const labelLocal = $('rtc-label-local');
    const refreshOperacao = () => {
      const mercadoria = estado.value === 'mercadorias';
      labelLocal.textContent = mercadoria ? 'ICMS (%)' : 'ISS (%)';
      $('rtc-l-local-nome').textContent = mercadoria ? 'ICMS remanescente' : 'ISS remanescente';
      grupoIcms.hidden = !mercadoria;
      localInput.value = mercadoria ? '18,00' : '5,00';
      ocultarResultado();
    };
    estado.addEventListener('change', refreshOperacao);
    $('rtc-ano').addEventListener('change', () => {
      const teste = $('rtc-ano').value === '2026';
      $('rtc-cbs').disabled = teste;
      $('rtc-ibs').disabled = teste || Number($('rtc-ano').value) < 2029;
      ocultarResultado();
    });
    $('rtc-ano').dispatchEvent(new Event('change'));
    grupoIcms.hidden = true;

    ['rtc-receita','rtc-credito-pis','rtc-credito-icms','rtc-compras'].forEach(id => {
      const elem = $(id);
      elem.addEventListener('blur', () => {
        const val = parseBR(elem.value);
        if (elem.value.trim() && Number.isFinite(val) && val >= 0) {
          elem.value = val.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
        }
      });
    });

    form.addEventListener('click', () => {
      $('rtc-erro').hidden = true;
      try {
        const ano = Number($('rtc-ano').value);
        const receita = parseBR($('rtc-receita').value);
        const dados = {
          ano, receita, operacao: estado.value,
          pis: parseBR($('rtc-pis').value), local: parseBR($('rtc-local').value),
          creditoPis: parseBR($('rtc-credito-pis').value),
          creditoIcms: parseBR($('rtc-credito-icms').value),
          compras: parseBR($('rtc-compras').value),
          cbs: $('rtc-cbs').value.trim() ? parseBR($('rtc-cbs').value) : NaN,
          ibs: $('rtc-ibs').value.trim() ? parseBR($('rtc-ibs').value) : NaN
        };
        const res = simularRTC(dados);
        const per = $('rtc-periodo').value === 'mensal' ? 'mensal' : 'anual';
        $('rtc-resumo-ano').textContent = `Ano ${ano} · Valores ${per} · ${estado.value === 'mercadorias' ? 'mercadorias (ICMS)' : 'serviços (ISS)'}.`;
        $('rtc-atual-total').textContent = moeda(res.atual);
        $('rtc-futuro-total').textContent = moeda(res.futuro);
        $('rtc-diferenca').textContent = (res.diferenca > 0 ? '+' : '') + moeda(res.diferenca);
        $('rtc-atual-pct').textContent = porcento(res.atual / receita * 100) + ' da receita';
        $('rtc-futuro-pct').textContent = porcento(res.futuro / receita * 100) + ' da receita';
        $('rtc-l-pis').textContent = moeda(res.pisValor);
        $('rtc-l-local').textContent = moeda(res.localValor);
        $('rtc-l-cbs').textContent = moeda(res.cbsValor);
        $('rtc-l-ibs').textContent = moeda(res.ibsValor);
        $('rtc-l-total').textContent = moeda(res.futuro);
        $('rtc-teste').hidden = !res.anoTeste;
        if (res.anoTeste) {
          $('rtc-teste-cbs').textContent = moeda(res.testeCBS);
          $('rtc-teste-ibs').textContent = moeda(res.testeIBS);
        }
        $('rtc-premissas').textContent = res.anoTeste
          ? '2026: referência baseada somente em PIS/Cofins e ICMS/ISS informados. CBS 0,9% e IBS 0,1% são exibidos à parte como valores nominais do teste, sem simulação da dispensa ou compensação efetiva.'
          : `Projeção: CBS de ${porcento(res.cbsAliquota)}, IBS de ${porcento(res.ibsAliquota)}; ICMS/ISS remanescente de ${porcento(res.shares.legado * 100)}. Créditos de IBS/CBS calculados sobre as aquisições elegíveis informadas. A alíquota integral futura é hipótese do usuário.`;
        $('rtc-resultado').hidden = false;
        $('rtc-resultado').scrollIntoView({behavior:'smooth', block:'start'});
      } catch(err) {
        $('rtc-resultado').hidden = true;
        $('rtc-erro').textContent = err.message || 'Não foi possível calcular.';
        $('rtc-erro').hidden = false;
      }
    });
    $('rtc-refazer').addEventListener('click', () => {
      $('rtc-resultado').hidden = true;
      $('rtc-titulo-dados').scrollIntoView({behavior:'smooth',block:'start'});
    });
  }
  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', iniciar);
  } else iniciar();
})(typeof window !== 'undefined' ? window : null);
