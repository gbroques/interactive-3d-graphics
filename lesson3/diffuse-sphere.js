/* eslint-env browser */
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';

export default class DiffuseSphere {
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
  const aspectRatio = width / height;
  const camera = new THREE.PerspectiveCamera(45, aspectRatio, 1, 80000);
  camera.position.set(-300, 300, -1000);
  camera.lookAt(0, 0, 0);
  return camera;
}

function createRenderer(width, height) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  return renderer;
}

function createOrbitControls(camera, domElement) {
  const controls = new OrbitControls(camera, domElement);
  controls.target.set(0, 0, 0);
  return controls;
}

function createScene() {
  const scene = new THREE.Scene();

  // LIGHTS
  const ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);

  const light = new THREE.DirectionalLight(0xffffff, 0.7);
  light.position.set(-800, 900, 300);
  scene.add(light);

  const sphere = createSphere();
  scene.add(sphere);

  const size = 1000;
  const divisions = 10;
  const grid = new THREE.GridHelper(size, divisions);
  grid.position.y = -400;
  scene.add(grid);

  return scene;
}

function createSphere() {
  const material = new THREE.MeshLambertMaterial({
    color: 0x80FC66,
  });

  const sphere = new THREE.Mesh(new THREE.SphereGeometry(400, 64, 32), material);
  return sphere;
}
