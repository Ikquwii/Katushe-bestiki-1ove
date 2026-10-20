(() => {
  'use strict';
  const screens = [...document.querySelectorAll('.screen')];
  const announcer = document.getElementById('announcer');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const openButton = document.getElementById('open-card');
  const canvas = document.getElementById('confetti');
  let opening = false;
  let giftRevealed = false;
  let animationFrame = 0;

  function showScreen(id) {
    screens.forEach(screen => {
      screen.hidden = screen.id !== id;
      screen.classList.remove('arriving');
    });
    const screen = document.getElementById(id);
    screen.classList.add('arriving');
    document.getElementById('cover').classList.remove('opening');
    openButton.disabled = false;
    opening = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
    const focusTarget = id === 'cover' ? openButton : screen.querySelector('h2');
    focusTarget.focus({ preventScroll: true });
  }

  openButton.addEventListener('click', () => {
    if (opening) return;
    opening = true;
    openButton.disabled = true;
    document.getElementById('cover').classList.add('opening');
    window.setTimeout(() => showScreen('letter'), reducedMotion.matches ? 0 : 1100);
  });

  document.querySelectorAll('[data-go]').forEach(button => {
    button.addEventListener('click', () => showScreen(button.dataset.go));
  });

  document.getElementById('get-gift').addEventListener('click', () => {
    showScreen('gift');
    if (!giftRevealed) {
      giftRevealed = true;
      celebrate();
    }
  });

  document.getElementById('claim-gift').addEventListener('click', event => {
    event.currentTarget.hidden = true;
    const confirmation = document.getElementById('claim-confirmation');
    confirmation.hidden = false;
    announcer.textContent = 'Всё твоё, Катюша.';
    confirmation.setAttribute('tabindex', '-1');
    confirmation.focus({ preventScroll: true });
  });

  function celebrate() {
    if (reducedMotion.matches) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * scale;
    canvas.height = height * scale;
    context.scale(scale, scale);
    const colors = ['#862c3e', '#be7b86', '#d8b493', '#e5c3c0', '#af8e60'];
    const pieces = Array.from({ length: 95 }, () => ({
      x: width * (.15 + Math.random() * .7),
      y: -30 - Math.random() * height * .55,
      vx: (Math.random() - .5) * 1.8,
      vy: 1.7 + Math.random() * 2.8,
      size: 3 + Math.random() * 4,
      angle: Math.random() * Math.PI,
      spin: (Math.random() - .5) * .06,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    let start;
    let previous;
    function frame(time) {
      if (start === undefined) start = previous = time;
      const age = time - start;
      const delta = Math.min((time - previous) / 16.67, 3);
      previous = time;
      context.clearRect(0, 0, width, height);
      if (age > 4200 || reducedMotion.matches) {
        animationFrame = 0;
        return;
      }
      context.globalAlpha = Math.min(1, (4200 - age) / 1000);
      pieces.forEach(piece => {
        piece.x += piece.vx * delta;
        piece.y += piece.vy * delta;
        piece.angle += piece.spin * delta;
        context.save();
        context.translate(piece.x, piece.y);
        context.rotate(piece.angle);
        context.fillStyle = piece.color;
        context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * .5);
        context.restore();
      });
      animationFrame = requestAnimationFrame(frame);
    }
    animationFrame = requestAnimationFrame(frame);
  }

  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(animationFrame);
  });
})();
