/**
 * Lightweight BI / data-viz hero scene (Three.js CDN).
 * A quiet line-and-area graph sits behind the copy.
 * Disable with ?no3d=1 or localStorage.krushmi_no3d=1
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = matchMedia('(max-width: 820px)').matches;
const params = new URLSearchParams(location.search);
const disabled =
  params.get('no3d') === '1' ||
  localStorage.getItem('krushmi_no3d') === '1' ||
  reduce ||
  mobile;

const host = document.querySelector('.hero-viz');
const canvas = document.getElementById('bi-canvas');
if (!host || !canvas) {
  /* nothing */
} else if (disabled) {
  host.classList.add('fallback-only');
} else {
  boot();
}

function boot() {
  const hero = document.getElementById('home');
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'low-power'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(1.4, 0.55, 8.4);

  const ambient = new THREE.AmbientLight(0xffffff, 0.95);
  scene.add(ambient);

  const root = new THREE.Group();
  scene.add(root);

  const navy = 0x14306b;
  const blue = 0x3b82f6;
  const soft = 0x93c5fd;
  const floorY = -1.35;

  const grid = new THREE.GridHelper(14, 18, soft, 0xd7e4f6);
  grid.position.set(1.6, floorY, -0.8);
  grid.material.transparent = true;
  grid.material.opacity = 0.22;
  root.add(grid);

  // Gentle upward series, shifted right so the headline stays clear.
  const base = [
    [-5.2, -0.85],
    [-4.1, -0.55],
    [-3.0, -0.72],
    [-1.9, -0.18],
    [-0.8, -0.38],
    [0.3, 0.22],
    [1.4, 0.05],
    [2.5, 0.72],
    [3.6, 0.48],
    [4.7, 1.05],
    [5.8, 0.88]
  ];

  const live = base.map(([x, y]) => new THREE.Vector3(x, y, 0));

  const lineGeo = new THREE.BufferGeometry().setFromPoints(live);
  const line = new THREE.Line(
    lineGeo,
    new THREE.LineBasicMaterial({
      color: blue,
      transparent: true,
      opacity: 0.55
    })
  );
  root.add(line);

  const areaMat = new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
    transparent: true,
    opacity: 0.1,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  let area = new THREE.Mesh(makeAreaGeometry(live, floorY), areaMat);
  area.position.z = -0.02;
  root.add(area);

  const dots = new THREE.Group();
  live.forEach((v, i) => {
    const d = new THREE.Mesh(
      new THREE.SphereGeometry(i === live.length - 1 ? 0.055 : 0.04, 10, 10),
      new THREE.MeshBasicMaterial({
        color: i === live.length - 1 ? navy : whiteSafe(i),
        transparent: true,
        opacity: 0.55
      })
    );
    d.position.copy(v);
    dots.add(d);
  });
  root.add(dots);

  function whiteSafe(i) {
    return i % 2 ? navy : 0xffffff;
  }

  function makeAreaGeometry(points, bottom) {
    const shape = new THREE.Shape();
    shape.moveTo(points[0].x, bottom);
    points.forEach((p) => shape.lineTo(p.x, p.y));
    shape.lineTo(points[points.length - 1].x, bottom);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }

  function refreshGraph() {
    lineGeo.setFromPoints(live);
    lineGeo.attributes.position.needsUpdate = true;
    area.geometry.dispose();
    area.geometry = makeAreaGeometry(live, floorY);
    live.forEach((v, i) => dots.children[i].position.copy(v));
  }

  let w = 0;
  let h = 0;
  function resize() {
    const rect = host.getBoundingClientRect();
    w = Math.max(1, Math.floor(rect.width));
    h = Math.max(1, Math.floor(rect.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  let mx = 0;
  let my = 0;
  let tx = 0;
  let ty = 0;
  window.addEventListener(
    'pointermove',
    (e) => {
      const r = host.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      ty = -(((e.clientY - r.top) / r.height) * 2 - 1);
    },
    { passive: true }
  );

  let running = true;
  let raf = 0;
  const clock = new THREE.Clock();

  function frame() {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const t = clock.getElapsedTime();
    mx += (tx - mx) * 0.04;
    my += (ty - my) * 0.04;

    live.forEach((v, i) => {
      v.y = base[i][1] + Math.sin(t * 0.45 + i * 0.4) * 0.055;
    });
    refreshGraph();

    // Slight parallax only: no spinning cluster in front of the type.
    root.rotation.y = mx * 0.08;
    root.rotation.x = 0.12 + my * 0.06;
    camera.position.x = 1.4 + mx * 0.22;
    camera.position.y = 0.55 + my * 0.12;
    camera.lookAt(1.1, 0.15, 0);
    renderer.render(scene, camera);
  }

  function pause() {
    running = false;
    cancelAnimationFrame(raf);
  }
  function resume() {
    if (running) return;
    running = true;
    clock.start();
    frame();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
    else resume();
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) resume();
          else pause();
        });
      },
      { threshold: 0.05 }
    );
    io.observe(hero || host);
  }

  host.classList.add('live-3d');
  frame();
}
