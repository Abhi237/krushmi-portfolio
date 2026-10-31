(function(){var b=document.querySelector('.menu-btn'),m=document.getElementById('menu');
b.addEventListener('click',function(){var o=m.classList.toggle('open');b.setAttribute('aria-expanded',o)});
m.addEventListener('click',function(e){if(e.target.tagName==='A'){m.classList.remove('open');b.setAttribute('aria-expanded','false')}});
document.getElementById('yr').textContent=new Date().getFullYear();})();
(function(){if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
document.documentElement.classList.add('js');
var els=document.querySelectorAll('.section-title,.section .two-col>div,.skill-grid li,.edu-item,.card,.timeline>li,.more');
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
els.forEach(function(el,i){el.classList.add('reveal');el.style.transitionDelay=(i%4)*60+'ms';io.observe(el)});})();
