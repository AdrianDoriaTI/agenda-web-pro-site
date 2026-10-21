// Escala a tela virtual dos aparelhos (data-w px de largura) para o tamanho real da moldura.
document.querySelectorAll<HTMLElement>('[data-fit-vp]').forEach((vp) => {
  const w = Number(vp.dataset.w) || 390;
  const box = vp.parentElement!;
  const fit = () => vp.style.setProperty('--s', String(box.clientWidth / w));
  fit();
  new ResizeObserver(fit).observe(box);
});
