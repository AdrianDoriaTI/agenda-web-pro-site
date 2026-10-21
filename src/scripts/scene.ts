// Cenas de demonstração (DESIGN §5.4). A rolagem só dispara a etapa (sem scrub).
// Marcação usada dentro de cada [data-scene]:
//   data-marker            um por etapa (gatilho de rolagem)
//   data-dot / data-cap    bolinhas e legenda de cada etapa
//   data-from / data-to    elemento fica .on nessas etapas (data-delay: atraso ao avançar)
//   data-tap (+tap-delay)  toque demonstrativo ao chegar na etapa
//   data-focus             área em foco da etapa (contorno + câmera); data-cam="top" não rola
//   data-page              página simulada que a câmera rola (data-vis="topo,base" visíveis)
//   data-zoom no [data-scene]: lista de zoom por etapa, ex.: "1,1.06,1"
import { diasDemo } from '../data/demo';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
// Telas pequenas: o celular inteiro aproxima a área em foco (o texto fica legível).
const pequena = window.matchMedia('(max-width: 47.99rem)');

// Datas de verdade (o HTML vem com as do dia do build).
const dias = diasDemo(new Date());
document.querySelectorAll<HTMLElement>('[data-dia]').forEach((el) => {
  const d = dias[Number(el.dataset.dia)];
  if (!d) return;
  const b = el.querySelector('b');
  const s = el.querySelector('small');
  if (b) b.textContent = d.rotulo;
  if (s) s.textContent = d.data;
});

// "Sexta, 09/10" para o dia de hoje (painel: "Próximo · …").
const SEMANA_LONGA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const agora = new Date();
document.querySelectorAll<HTMLElement>('[data-hoje-longo]').forEach((el) => {
  el.textContent = `${SEMANA_LONGA[agora.getDay()]}, ${dias[0].data}`;
});

// Posição de um elemento dentro de um ancestral (ignora transform).
const topIn = (el: HTMLElement, anc: HTMLElement) => {
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== anc) { y += n.offsetTop; n = n.offsetParent as HTMLElement | null; }
  return y;
};
const leftIn = (el: HTMLElement, anc: HTMLElement) => {
  let x = 0;
  let n: HTMLElement | null = el;
  while (n && n !== anc) { x += n.offsetLeft; n = n.offsetParent as HTMLElement | null; }
  return x;
};

document.querySelectorAll<HTMLElement>('[data-scene]').forEach((scene) => {
  const $$ = <T extends HTMLElement>(s: string) => Array.from(scene.querySelectorAll<T>(s));
  const markers = $$('[data-marker]');
  const total = markers.length;
  const dots = $$('[data-dot]');
  const caps = $$('[data-cap]');
  const states = $$('[data-from],[data-to]');
  const taps = $$('[data-tap]');
  const focusEls = $$('[data-focus]');
  const count = scene.querySelector<HTMLElement>('[data-count]');
  const zoom = (scene.dataset.zoom ?? '').split(',').map(Number);
  // data-mzoom="topo": no celular, mantém o início da tela à vista (onde a pessoa está) e não rola.
  const topo = scene.dataset.mzoom === 'topo';
  let step = 0;
  let timers: number[] = [];
  let lock = false;
  let lockTimer = 0;

  // "Câmera": rola a página simulada e aproxima só o conteúdo (cabeçalho e barras do app ficam parados).
  const camera = (n: number) => {
    focusEls.filter((el) => Number(el.dataset.focus) === n).forEach((target) => {
      const pg = target.closest<HTMLElement>('[data-page]');
      if (!pg) return;
      const [vTop, vBottom] = (pg.dataset.vis ?? '104,744').split(',').map(Number);
      const top = topIn(target, pg);
      const mid = top + target.offsetHeight / 2;
      const max = Math.max(0, pg.offsetHeight - (vBottom - vTop));
      const fixo = target.dataset.cam === 'top' || (topo && pequena.matches);
      const y = fixo ? 0 : Math.min(max, Math.max(0, pg.offsetTop + mid - (vTop + vBottom) / 2));
      const z = reduce.matches ? 1 : zoom[n - 1] || 1;
      pg.style.transformOrigin = `50% ${mid}px`;
      pg.style.transform = `translateY(${-y}px) scale(${z})`;
      pg.dataset.y = String(y);
    });
  };

  // Zoom do aparelho (só em tela pequena): leva a área em foco ao centro e quase à largura toda.
  const dev = scene.querySelector<HTMLElement>('.dev');
  const zoomDevice = (n: number) => {
    const phone = scene.querySelector<HTMLElement>('.phone');
    if (!phone || !dev) return;
    const target = focusEls.find((el) => Number(el.dataset.focus) === n && phone.contains(el));
    const vp = phone.querySelector<HTMLElement>('[data-fit-vp]');
    if (!pequena.matches || !target || !vp) { phone.style.transform = ''; return; }
    const sc = parseFloat(vp.style.getPropertyValue('--s')) || 0.55;
    const pg = target.closest<HTMLElement>('[data-page]');
    const scr = target.closest<HTMLElement>('.scr') ?? vp;
    // Centro do alvo em px virtuais (já com a rolagem simulada aplicada).
    const cy = pg ? pg.offsetTop + topIn(target, pg) - Number(pg.dataset.y ?? 0) + target.offsetHeight / 2 : topIn(target, scr) + target.offsetHeight / 2;
    const cx = pg ? pg.offsetLeft + leftIn(target, pg) + target.offsetWidth / 2 : leftIn(target, scr) + target.offsetWidth / 2;
    const bezel = phone.clientWidth * 0.035;
    const px = bezel + cx * sc;
    const py = bezel + cy * sc;
    let z: number;
    let tx: number;
    let ty: number;
    if (topo && pg) {
      // Largura útil da página cabe na janela; o topo da página encosta no alto da janela.
      z = Math.min(3.2, (dev.clientWidth - 16) / ((390 - 16) * sc));
      tx = dev.clientWidth / 2 - leftIn(phone, dev) - z * (bezel + 195 * sc);
      ty = 8 - topIn(phone, dev) - z * (bezel + (pg.offsetTop - 10) * sc);
    } else {
      z = Math.min(3.2, (dev.clientWidth - 32) / (target.offsetWidth * sc), (dev.clientHeight - 24) / (target.offsetHeight * sc));
      tx = dev.clientWidth / 2 - leftIn(phone, dev) - z * px;
      ty = dev.clientHeight / 2 - topIn(phone, dev) - z * py;
    }
    if (z < 1.05) { phone.style.transform = ''; return; }
    phone.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${z.toFixed(3)})`;
  };

  const later = (fn: () => void, ms: number) => { if (ms > 0) timers.push(window.setTimeout(fn, ms)); else fn(); };

  const set = (n: number, animate = true) => {
    if (n === step) return;
    const fwd = n > step;
    const live = animate && !reduce.matches;
    step = n;
    timers.forEach(clearTimeout);
    timers = [];
    scene.dataset.step = String(n);
    if (count) count.textContent = String(n).padStart(2, '0');
    dots.forEach((d) => {
      d.setAttribute('aria-current', Number(d.dataset.dot) === n ? 'step' : 'false');
      d.classList.toggle('done', Number(d.dataset.dot) < n);
    });
    caps.forEach((c) => c.classList.toggle('on', Number(c.dataset.cap) === n));

    states.forEach((el) => {
      const on = n >= Number(el.dataset.from ?? 1) && n <= Number(el.dataset.to ?? total);
      const turningOn = on && !el.classList.contains('on');
      const delay = live && fwd && turningOn ? Number(el.dataset.delay ?? 320) : 0;
      later(() => el.classList.toggle('on', on), delay);
    });
    focusEls.forEach((el) => el.classList.remove('focus'));
    focusEls.filter((el) => Number(el.dataset.focus) === n).forEach((f) => later(() => f.classList.add('focus'), live ? 600 : 0));
    if (live && fwd) {
      taps.filter((el) => Number(el.dataset.tap) === n).forEach((el) => {
        later(() => {
          el.classList.add('tap');
          window.setTimeout(() => el.classList.remove('tap'), 420);
        }, Number(el.dataset.tapDelay ?? 120));
      });
    }
    camera(n);
  };

  // Celular: as etapas passam deslizando dentro da caixa da demonstração (camada [data-swipe] com
  // uma página por etapa e encaixe). Fora dela a página rola normalmente, sem mexer nas imagens.
  const swipe = scene.querySelector<HTMLElement>('[data-swipe]');
  const naCaixa = () => pequena.matches && !!swipe && swipe.offsetParent !== null;

  const go = (n: number) => {
    n = Math.min(total, Math.max(1, n));
    if (naCaixa()) {
      swipe!.scrollTo({ top: (n - 1) * swipe!.clientHeight, behavior: reduce.matches ? 'auto' : 'smooth' });
      return;
    }
    lock = true;
    clearTimeout(lockTimer);
    lockTimer = window.setTimeout(() => { lock = false; }, 900);
    set(n);
    zoomDevice(n);
    markers[n - 1].scrollIntoView({ block: 'center', behavior: reduce.matches ? 'auto' : 'smooth' });
  };

  set(1, false);
  document.fonts?.ready.then(() => zoomDevice(step));

  const io = new IntersectionObserver((entries) => {
    if (lock) return;
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const n = markers.indexOf(e.target as HTMLElement) + 1;
      set(n);
      zoomDevice(n);
    });
  }, { rootMargin: '-49% 0px -49% 0px' });
  markers.forEach((m) => io.observe(m));

  // Rolagem dentro da caixa: a linha do trilho acompanha o dedo e a etapa troca no meio do caminho.
  const rail = scene.querySelector<HTMLElement>('[data-rail]');
  let raf = 0;
  const onSwipe = () => {
    raf = 0;
    if (!swipe || !naCaixa()) return;
    const h = swipe.clientHeight;
    const max = swipe.scrollHeight - h;
    rail?.style.setProperty('--p', (max > 0 ? Math.min(1, Math.max(0, swipe.scrollTop / max)) : 0).toFixed(4));
    const n = Math.min(total, Math.max(1, Math.round(swipe.scrollTop / h) + 1));
    if (n !== step) { set(n); zoomDevice(n); }
  };
  swipe?.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(onSwipe); }, { passive: true });

  dots.forEach((d) => d.addEventListener('click', () => go(Number(d.dataset.dot))));
  scene.querySelector('[data-prev]')?.addEventListener('click', () => go(step - 1));
  scene.querySelector('[data-next]')?.addEventListener('click', () => go(step + 1));
  scene.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(step + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(step - 1); }
  });
  // Recalcula a câmera se a tela mudar de tamanho (fontes, rotação).
  // No celular, mantém a caixa encaixada na etapa atual.
  window.addEventListener('resize', () => {
    camera(step);
    zoomDevice(step);
    if (naCaixa()) swipe!.scrollTop = (step - 1) * swipe!.clientHeight;
  }, { passive: true });
});
