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

  /* Active nav underline while scrolling */
  (function () {
    var links = Array.prototype.slice.call(document.querySelectorAll('.menu a[href^="#"]'));
    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var sec = document.getElementById(id);
      if (sec) map[id] = { link: a, el: sec };
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
      io.observe(map[id].el);
    });
    if (location.hash) setActive(location.hash.slice(1));
  })();

  if (reduce) return;
  document.documentElement.classList.add('js', 'motion');

  /* Typewriter / cycling roles */
  (function () {
    var roles = ['Data Analytics', 'Business Analytics', 'Business Intelligence'];
    var staticEl = document.querySelector('.typed-static');
    var textEl = document.querySelector('.typed-text');
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
        return setTimeout(tick, 40);
      }
      if (!deleting) {
        char++;
        textEl.textContent = word.slice(0, char);
        if (char === word.length) {
          deleting = true;
          pause = 28;
        }
      } else {
        char--;
        textEl.textContent = word.slice(0, char);
        if (char === 0) {
          deleting = false;
          i = (i + 1) % roles.length;
          pause = 8;
        }
      }
      setTimeout(tick, deleting ? 36 : 70);
    }
    tick();
  })();

  /* Stronger staggered scroll reveals */
  (function () {
    if (!('IntersectionObserver' in window)) return;
    var groups = [
      ['.section-title', 0],
      ['.about-copy > p, .about-copy .snowy-note, .about-copy .snowy', 70],
      ['.skill-grid li', 45],
      ['.edu-item', 90],
      ['.card', 80],
      ['.timeline > li', 100],
      ['.more', 0],
      ['.contact .lead, .contact-links, .email-line', 60]
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
          }, 900);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
    );
    groups.forEach(function (g) {
      var sel = g[0];
      var step = g[1];
      document.querySelectorAll(sel).forEach(function (el, i) {
        el.classList.add('reveal');
        el.style.transitionDelay = i * step + 'ms';
        io.observe(el);
      });
    });
  })();

  /* CTA shine once when first seen */
  (function () {
    if (!('IntersectionObserver' in window)) return;
    var btns = document.querySelectorAll('.actions .btn, .contact-links a');
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add('shine');
          io.unobserve(e.target);
        });
      },
      { threshold: 0.6 }
    );
    btns.forEach(function (b) {
      io.observe(b);
    });
  })();

  /* Soft desktop cursor + magnetic buttons */
  if (finePointer && window.innerWidth > 900) {
    var dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);
    document.documentElement.classList.add('has-cursor');
    var x = 0;
    var y = 0;
    var cx = 0;
    var cy = 0;
    window.addEventListener(
      'mousemove',
      function (e) {
        x = e.clientX;
        y = e.clientY;
      },
      { passive: true }
    );
    (function loop() {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      dot.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a, button').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        dot.classList.add('grow');
      });
      el.addEventListener('mouseleave', function () {
        dot.classList.remove('grow');
      });
    });
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.12;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.18;
        btn.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }
})();
