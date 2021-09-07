/* eslint-env browser */
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/libs/dat.gui.module';

export default class DiffuseSphere {
  constructor(options) {
    const {
      rootDomElement,
      width,
      height,
    } = options;

    this._camera = createCamera(width, height);
    this._controller = {
      flatShading: false,
    };
    this._scene = createScene(this._controller);
    this._renderer = createRenderer(width, height);
    this._orbitControls = createOrbitControls(this._camera, this._renderer.domElement);

    this._animate();

    const gui = createGUI(this._controller);
    this._render();
    this._mount(rootDomElement, gui.domElement);
  }

  resize(width, height) {
    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();
    this._renderer.setSize(width, height);
  }

  _mount(rootDomElement, guiDomElement) {
    const { top } = rootDomElement.getBoundingClientRect();
    rootDomElement.appendChild(this._renderer.domElement);
    const guiContainer = createGuiContainer(guiDomElement);
    guiContainer.style.top = `${top}px`;

    rootDomElement.appendChild(guiContainer);
  }

  _animate() {
    this._orbitControls.update();
    this._render();
    window.requestAnimationFrame(() => this._animate());
  }

  _render() {
    if (this._previousFlatShading !== this._controller.flatShading) {
      const geometry = createSphereGeometry(this._controller.flatShading);
      const sphere = this._scene.getObjectByName('Sphere');
      sphere.geometry = geometry;
    }
    this._previousFlatShading = this._controller.flatShading;
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

function createScene(controller) {
  const scene = new THREE.Scene();

  // LIGHTS
  // 0x666666 = 0xFFFFFF * 0.4
  const ambientLight = new THREE.AmbientLight(0x666666);
  scene.add(ambientLight);

  const light = new THREE.DirectionalLight(0xffffff, 0.7);
  light.position.set(-800, 900, 300);
  scene.add(light);

  const sphere = createSphere(controller.flatShading);
  scene.add(sphere);

  const size = 1000;
  const divisions = 10;
  const grid = new THREE.GridHelper(size, divisions);
  grid.position.y = -400;
  scene.add(grid);

  return scene;
}

function createSphere(flatShading) {
  const material = new THREE.MeshLambertMaterial({
    color: 0x80FC66,
  });
  const geometry = createSphereGeometry(flatShading);
  const sphere = new THREE.Mesh(geometry, material);
  sphere.name = 'Sphere';
  return sphere;
}

function createSphereGeometry(flatShading) {
  let geometry = new THREE.SphereGeometry(400, 64, 32);
  // https://github.com/mrdoob/three.js/issues/7130#issuecomment-770235574
  // Convert geometry to "triangle soup".
  if (flatShading) {
    const nonIndexedGeometry = geometry.toNonIndexed();
    nonIndexedGeometry.computeVertexNormals();
    geometry = nonIndexedGeometry;
  }
  return geometry;
}

function createGuiContainer(guiDomElement) {
  const autoPlaceContainer = window.document.createElement('div');
  const datGuiCssNamespace = guiDomElement.classList[0];
  autoPlaceContainer.classList.add(datGuiCssNamespace);
  autoPlaceContainer.classList.add(GUI.CLASS_AUTO_PLACE_CONTAINER);
  guiDomElement.classList.add(GUI.CLASS_AUTO_PLACE);
  autoPlaceContainer.appendChild(guiDomElement);
  return autoPlaceContainer;
}

function createGUI(controller) {
  const gui = new GUI({ autoPlace: false });
  gui.closed = false;
  gui.add(controller, 'flatShading')
    .name('Flat Shading');
  return gui;
}
