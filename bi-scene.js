/**
 * Lightweight BI / data-viz hero scene (Three.js CDN).
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
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 1.4, 7.2);

  const ambient = new THREE.AmbientLight(0xffffff, 0.85);
  const key = new THREE.DirectionalLight(0xffffff, 0.55);
  key.position.set(3, 6, 4);
  const fill = new THREE.DirectionalLight(0x93c5fd, 0.35);
  fill.position.set(-4, 2, -2);
  scene.add(ambient, key, fill);

  const root = new THREE.Group();
  scene.add(root);

  const navy = 0x14306b;
  const blue = 0x3b82f6;
  const soft = 0x93c5fd;
  const white = 0xffffff;

  // Translucent grid plane
  const grid = new THREE.GridHelper(8, 12, soft, 0xdbe7f8);
  grid.position.y = -1.2;
  grid.material.transparent = true;
  grid.material.opacity = 0.55;
  root.add(grid);

  // Bar chart cluster
  const bars = new THREE.Group();
  const heights = [0.7, 1.35, 0.95, 1.7, 1.15, 1.9, 1.4];
  heights.forEach((h, i) => {
    const geo = new THREE.BoxGeometry(0.32, h, 0.32);
    const mat = new THREE.MeshStandardMaterial({
      color: i % 2 ? navy : blue,
      roughness: 0.45,
      metalness: 0.08,
      transparent: true,
      opacity: 0.92
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(i * 0.48 - 1.45, h / 2 - 1.05, 0.6);
    bars.add(mesh);
  });
  bars.position.set(-1.6, 0, -0.4);
  root.add(bars);

  // Donut / ring chart
  const donut = new THREE.Mesh(
    new THREE.TorusGeometry(0.85, 0.22, 16, 48),
    new THREE.MeshStandardMaterial({
      color: soft,
      roughness: 0.35,
      metalness: 0.12,
      transparent: true,
      opacity: 0.9
    })
  );
  donut.position.set(1.85, 0.35, 0.2);
  donut.rotation.x = Math.PI / 2.4;
  root.add(donut);
  const donutCore = new THREE.Mesh(
    new THREE.TorusGeometry(0.85, 0.08, 12, 48, Math.PI * 1.2),
    new THREE.MeshStandardMaterial({ color: navy, roughness: 0.4, metalness: 0.1 })
  );
  donutCore.position.copy(donut.position);
  donutCore.rotation.copy(donut.rotation);
  root.add(donutCore);

  // Scatter points
  const scatter = new THREE.Group();
  const pts = [
    [-0.2, 0.2, 1.4],
    [0.3, 0.7, 1.1],
    [0.8, 0.35, 1.5],
    [1.1, 1.0, 1.2],
    [0.05, 1.15, 1.55],
    [0.55, 1.4, 1.35]
  ];
  pts.forEach((p, i) => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 12, 12),
      new THREE.MeshStandardMaterial({ color: i % 2 ? blue : navy, roughness: 0.3 })
    );
    m.position.set(p[0], p[1], p[2]);
    scatter.add(m);
  });
  scatter.position.set(0.2, -0.2, 0);
  root.add(scatter);

  // Line chart polyline
  const linePts = [
    new THREE.Vector3(-2.4, -0.3, 1.8),
    new THREE.Vector3(-1.7, 0.15, 1.8),
    new THREE.Vector3(-1.1, -0.05, 1.8),
    new THREE.Vector3(-0.5, 0.55, 1.8),
    new THREE.Vector3(0.1, 0.35, 1.8),
    new THREE.Vector3(0.7, 0.95, 1.8),
    new THREE.Vector3(1.3, 0.7, 1.8)
  ];
  const lineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
  const line = new THREE.Line(
    lineGeo,
    new THREE.LineBasicMaterial({ color: blue, transparent: true, opacity: 0.85 })
  );
  root.add(line);
  linePts.forEach((v) => {
    const d = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 10, 10),
      new THREE.MeshStandardMaterial({ color: white, roughness: 0.4 })
    );
    d.position.copy(v);
    root.add(d);
  });

  // Floating translucent panels (dashboard metaphor)
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0xe8eef8,
    transparent: true,
    opacity: 0.35,
    roughness: 0.6,
    metalness: 0
  });
  const panel = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 0.04), panelMat);
  panel.position.set(-2.3, 1.1, -0.8);
  panel.rotation.y = 0.35;
  root.add(panel);
  const panel2 = panel.clone();
  panel2.position.set(2.5, -0.2, -1.1);
  panel2.rotation.y = -0.4;
  root.add(panel2);

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

    root.rotation.y = t * 0.12 + mx * 0.35;
    root.rotation.x = 0.18 + my * 0.2;
    bars.position.y = Math.sin(t * 0.7) * 0.08;
    donut.rotation.z = t * 0.35;
    donutCore.rotation.z = t * 0.35;
    scatter.position.y = Math.sin(t * 0.9 + 1) * 0.1;
    camera.position.x = mx * 0.45;
    camera.position.y = 1.4 + my * 0.25;
    camera.lookAt(0, 0.2, 0);
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

  // Pause when hero far offscreen
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
