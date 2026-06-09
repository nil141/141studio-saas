/* Hestia Bistró — small UX scripts */

// Header: solid background once scrolled past hero
(function header(){
  const h = document.getElementById('siteHeader');
  if(!h) return;
  const onScroll = () => {
    h.classList.toggle('scrolled', window.scrollY > 60);
  };
  document.addEventListener('scroll', onScroll, { passive:true });
  onScroll();
})();

// Language toggle (visual only, ES is the only one wired)
(function lang(){
  const btns = document.querySelectorAll('.lang-btn');
  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    // TODO: hook real i18n when CAT/EN copy is ready
  }));
})();

// Menu accordion (Nuestra propuesta)
(function accordion(){
  const rows = document.querySelectorAll('.menu-row');
  rows.forEach(row => {
    const trigger = row.querySelector('.menu-row-trigger');
    if(!trigger) return;
    trigger.addEventListener('click', () => {
      const wasOpen = row.classList.contains('open');
      rows.forEach(r => r.classList.remove('open'));
      if(!wasOpen) row.classList.add('open');
    });
  });
  // Open first row by default
  if(rows[0]) rows[0].classList.add('open');
})();

// Smooth-scroll: account for fixed header offset
(function anchors(){
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      if(!id) return;
      const target = document.getElementById(id);
      if(!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 40;
      window.scrollTo({ top:y, behavior:'smooth' });
    });
  });
})();

// Reveal-on-scroll for sections
(function reveal(){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold:0.12, rootMargin:'0px 0px -60px 0px' });

  document.querySelectorAll(
    '.block-split, .bio-row, .full-image, .propuesta, .food-pair, .cta-strip'
  ).forEach(el => {
    el.classList.add('reveal');
    io.observe(el);
  });
})();
