/* eslint-env browser */
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';

export default class DrinkingBird {
  constructor(options) {
    const {
      rootDomElement,
      width,
      height,
    } = options;

    this._camera = createCamera(width, height);
    this._scene = createScene();
    this._renderer = createRenderer(width, height);
    this._orbitControls = createOrbitControls(this._camera, this._renderer.domElement);

    this._animate();

    this._render();
    this._mount(rootDomElement);
  }

  resize(width, height) {
    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();
    this._renderer.setSize(width, height);
  }

  _mount(rootDomElement) {
    rootDomElement.appendChild(this._renderer.domElement);
  }

  _animate() {
    this._orbitControls.update();
    this._render();
    window.requestAnimationFrame(() => this._animate());
  }

  _render() {
    this._renderer.render(this._scene, this._camera);
  }
}

function createCamera(width, height) {
  const fieldOfView = 45;
  const aspectRatio = width / height;
  const near = 1;
  const far = 40000;
  const camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    near,
    far,
  );
  camera.position.set(-480, 659, -619);
  return camera;
}

function createRenderer(width, height) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setClearColor(0xAAAAAA, 1.0);
  return renderer;
}

function createOrbitControls(camera, domElement) {
  const controls = new OrbitControls(camera, domElement);
  controls.target.set(4, 301, 92);
  return controls;
}

function createScene() {
  const scene = new THREE.Scene();

  scene.fog = new THREE.Fog(0x808080, 3000, 6000);
  // LIGHTS
  const ambientLight = new THREE.AmbientLight(0x222222);
  const light = new THREE.DirectionalLight(0xffffff, 1.0);
  light.position.set(200, 400, 500);

  const light2 = new THREE.DirectionalLight(0xffffff, 1.0);
  light2.position.set(-400, 200, -300);

  scene.add(ambientLight);
  scene.add(light);
  scene.add(light2);
  createDrinkingBird();

  return scene;
}

// Supporting frame for the bird - base + legs + feet
function createSupport() {
  const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xF07020 });
  // base
  let cube;
  cube = new THREE.Mesh(
    new THREE.BoxGeometry(20 + 64 + 110, 4, 2 * 77), cubeMaterial,
  );
  cube.position.x = -45;	// (20+32) - half of width (20+64+110)/2
  cube.position.y = 4 / 2;	// half of height
  cube.position.z = 0;	// centered at origin
  scene.add(cube);

  // left foot
  cube = new THREE.Mesh(
    new THREE.BoxGeometry(20 + 64 + 110, 52, 6), cubeMaterial,
  );
  cube.position.x = -45;	// (20+32) - half of width (20+64+110)/2
  cube.position.y = 52 / 2;	// half of height
  cube.position.z = 77 + 6 / 2;	// offset 77 + half of depth 6/2
  scene.add(cube);

  // left leg
  cube = new THREE.Mesh(
    new THREE.BoxGeometry(64, 334 + 52, 6), cubeMaterial,
  );
  cube.position.x = 0;	// centered on origin along X
  cube.position.y = (334 + 52) / 2;
  cube.position.z = 77 + 6 / 2;	// offset 77 + half of depth 6/2
  scene.add(cube);

  // right foot

  // right leg
}

// Body of the bird - body and the connector of body and head
function createBody() {
  const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xA00000 });
  const cylinderMaterial = new THREE.MeshLambertMaterial({ color: 0x0000D0 });
}

// Head of the bird - head + hat
function createHead() {
  const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xA00000 });
  const cylinderMaterial = new THREE.MeshLambertMaterial({ color: 0x0000D0 });
}

function createDrinkingBird() {
  // MODELS
  // base + legs + feet
  createSupport();

  // body + body/head connector
  createBody();

  // head + hat
  createHead();
}
