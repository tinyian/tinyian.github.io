import 'public_html/dissertation/client/src/css/style.css';
import * as THREE from 'public_html/dissertation/client/node_modules/three';
import { OrbitControls } from 'public_html/dissertation/client/node_modules/three/examples/jsm/controls/OrbitControls.js';

var style = getComputedStyle(document.body);

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
const material = new THREE.MeshStandardMaterial({
    color: style.getPropertyValue('--accent'),
    roughness: 0.0,
    metalness: 0.0,
    flatShading: false,
});
const torus = new THREE.Mesh(geometry, material);

scene.add(torus);

// Lights

const pointLight = new THREE.PointLight({
    color: 0xFAfAFA,
    intensity: 1,
    decay: 2,
});
pointLight.position.set(5, 5, 5);

const ambientLight = new THREE.AmbientLight({
    color: 0x404040,
    intensity: 1,
});
scene.add(pointLight, ambientLight);

// Helpers
//const skeleHelper = new THREE.SkeletonHelper(torus);
//const lightHelper = new THREE.PointLightHelper(pointLight)
//const gridHelper = new THREE.GridHelper(200, 50);
//scene.add(lightHelper, gridHelper, skeleHelper);

// const controls = new OrbitControls(camera, renderer.domElement);

function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
    const material = new THREE.MeshStandardMaterial({
        color: style.getPropertyValue('--primary'),
    });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x, y, z);
  scene.add(star);
}

Array(200).fill().forEach(addStar);

// Background

const colorTexture = new THREE.TextureLoader().load({ color: style.getPropertyValue('--bg-color') });

scene.background = colorTexture;

// Avatar

//const cubeTexture = new THREE.TextureLoader().load('../public/favicon.png');

const cubeGeo = new THREE.BoxGeometry(3, 3, 3);
                                                   
const cubeMat = new THREE.MeshStandardMaterial({
    color: 0xd88db6,
    roughness: 0.0,
    metalness: 0.0,
    flatShading: false,
});

const cube = new THREE.Mesh(cubeGeo, cubeMat);

scene.add(cube);

// Ball

const paperTexture = new THREE.TextureLoader().load('../src/assets/images/paper.jpg');
const normalTexture = new THREE.TextureLoader().load('../src/assets/images/paper_normal.jpg');
const roughTexture = new THREE.TextureLoader().load('../src/assets/images/paper_rough.jpg');

const paper = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshStandardMaterial({
    map: paperTexture,
    normalMap: normalTexture,
    roughness: 0.0,
    roughnessMap: roughTexture,
//    emissive: style.getPropertyValue('--primary'),
//    emissiveIntensity: 1.0,
  })
);

scene.add(paper);

paper.position.z = 30;
paper.position.setX(-10);

cube.position.z = -5;
cube.position.x = 2;

// Scroll Animation

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  paper.rotation.x += 0.05;
  paper.rotation.y += 0.075;
  paper.rotation.z += 0.05;

  cube.rotation.y += 0.01;
  cube.rotation.z += 0.01;

  camera.position.z = t * -0.01;
  camera.position.x = t * -0.0002;
  camera.rotation.y = t * -0.0002;
}

document.body.onscroll = moveCamera;
moveCamera();

// Animation Loop

function animate() {
  requestAnimationFrame(animate);

  torus.rotation.x += 0.01;
  torus.rotation.y += 0.005;
  torus.rotation.z += 0.01;

  paper.rotation.x += 0.005;

  // controls.update();

  renderer.render(scene, camera);
}

animate();
