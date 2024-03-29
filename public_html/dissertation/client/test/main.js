import * as THREE from '/~io202/dissertation/client/node_modules/.vite/deps/three.js?v=734c07de';
import { OrbitControls } from '/~io202/dissertation/client/node_modules/.vite/deps/three_examples_jsm_controls_OrbitControls.js?v=46295345';

// Canvas Setup

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#webgl'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);
camera.position.setX(-3);

renderer.render(scene, camera);

// Torus

const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshBasicMaterial({
    color: 0xFAFAFA, wireframe: true
});
const torus = new THREE.Mesh(geometry, material);

scene.add(torus);

// Animation Loop

function animate() {
  requestAnimationFrame(animate);

  torus.rotation.x += 0.01;
  torus.rotation.y += 0.005;
  torus.rotation.z += 0.01;

  // controls.update();

  renderer.render(scene, camera);
}

animate();
