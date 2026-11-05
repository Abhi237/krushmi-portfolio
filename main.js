(function () {
  var b = document.querySelector('.menu-btn');
  var m = document.getElementById('menu');
  if (b && m) {
    b.addEventListener('click', function () {
      var o = m.classList.toggle('open');
      b.setAttribute('aria-expanded', o);
    });
    m.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        m.classList.remove('open');
        b.setAttribute('aria-expanded', 'false');
      }
    });
  }
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  (function () {
    var links = Array.prototype.slice.call(document.querySelectorAll('.menu a[href^="#"]'));
    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var sec = document.getElementById(id);
      if (sec) map[id] = a;
    });
    function setActive(id) {
      links.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + id);
      });
    }
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );
    Object.keys(map).forEach(function (id) {
      io.observe(document.getElementById(id));
    });
    if (location.hash) setActive(location.hash.slice(1));
  })();

  if (reduce) return;
  document.documentElement.classList.add('js', 'motion');

  /* Faster typewriter with soft fade between roles */
  (function () {
    var roles = ['Data Analytics', 'Business Analytics', 'Business Intelligence'];
    var staticEl = document.querySelector('.typed-static');
    var textEl = document.querySelector('.typed-text');
    var line = document.querySelector('.typed-line');
    if (!textEl || !staticEl) return;
    staticEl.hidden = true;
    textEl.hidden = false;
    var i = 0;
    var char = 0;
    var deleting = false;
    var pause = 0;
    function tick() {
      var word = roles[i];
      if (pause > 0) {
        pause--;
        return setTimeout(tick, 28);
      }
      if (!deleting) {
        char++;
        textEl.textContent = word.slice(0, char);
        if (char === word.length) {
          deleting = true;
          pause = 18;
        }
      } else {
        char--;
        textEl.textContent = word.slice(0, char);
        if (char === 0) {
          deleting = false;
          i = (i + 1) % roles.length;
          if (line) {
            line.classList.remove('role-swap');
            void line.offsetWidth;
            line.classList.add('role-swap');
          }
          pause = 4;
        }
      }
      setTimeout(tick, deleting ? 22 : 48);
    }
    tick();
  })();

  /* Stronger staggered scroll reveals */
  (function () {
    if (!('IntersectionObserver' in window)) return;
    var groups = [
      ['.section-title', 0, 'reveal-left'],
      ['.about-copy > p, .about-copy .snowy-note', 85, 'reveal'],
      ['.skill-grid li', 55, 'reveal'],
      ['.edu-item', 110, 'reveal'],
      ['.card', 110, 'reveal'],
      ['.timeline > li', 120, 'reveal'],
      ['.more', 0, 'reveal'],
      ['.contact .lead, .contact-links, .email-line', 70, 'reveal']
    ];
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var t = e.target;
          t.classList.add('in');
          io.unobserve(t);
          setTimeout(function () {
            t.style.transitionDelay = '';
          }, 1000);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -56px 0px' }
    );
    groups.forEach(function (g) {
      document.querySelectorAll(g[0]).forEach(function (el, i) {
        el.classList.add(g[2] || 'reveal');
        el.style.transitionDelay = i * g[1] + 'ms';
        io.observe(el);
      });
    });
    document.querySelectorAll('.timeline > li').forEach(function (el, i) {
      el.classList.add(i % 2 ? 'from-right' : 'from-left');
    });
    var tl = document.querySelector('.timeline');
    if (tl) {
      tl.classList.add('reveal-line');
      io.observe(tl);
    }
  })();

  /* CTA shine + pulse when first seen */
  (function () {
    if (!('IntersectionObserver' in window)) return;
    var btns = document.querySelectorAll('.actions .btn, .contact-links a');
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add('shine');
          if (e.target.classList.contains('primary')) e.target.classList.add('pulse');
          io.unobserve(e.target);
        });
      },
      { threshold: 0.55 }
    );
    btns.forEach(function (btn) {
      io.observe(btn);
    });
  })();

  /* Stronger desktop cursor + magnetic pull on buttons and skill tiles */
  if (finePointer && window.innerWidth > 900) {
    var ring = document.createElement('div');
    ring.className = 'cursor-ring';
    var dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(ring);
    document.body.appendChild(dot);
    document.documentElement.classList.add('has-cursor');
    var x = 0;
    var y = 0;
    var cx = 0;
    var cy = 0;
    var rx = 0;
    var ry = 0;
    window.addEventListener(
      'mousemove',
      function (e) {
        x = e.clientX;
        y = e.clientY;
      },
      { passive: true }
    );
    (function loop() {
      cx += (x - cx) * 0.28;
      cy += (y - cy) * 0.28;
      rx += (x - rx) * 0.14;
      ry += (y - ry) * 0.14;
      dot.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(loop);
    })();
    function grow() {
      dot.classList.add('grow');
      ring.classList.add('grow');
    }
    function shrink() {
      dot.classList.remove('grow');
      ring.classList.remove('grow');
    }
    document.querySelectorAll('a, button, .skill-grid li').forEach(function (el) {
      el.addEventListener('mouseenter', grow);
      el.addEventListener('mouseleave', shrink);
    });
    function magnet(el, strength) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * strength;
        var dy = (e.clientY - (r.top + r.height / 2)) * strength;
        el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = '';
      });
    }
    document.querySelectorAll('.btn').forEach(function (el) {
      magnet(el, 0.22);
    });
    document.querySelectorAll('.skill-grid li').forEach(function (el) {
      magnet(el, 0.1);
    });
  }
})();
