/* eslint-env browser */
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';

export default class Demo {
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
  const far = 4000;
  const camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    near,
    far,
  );
  camera.position.set(-200, 200, -150);
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
  scene.add(new THREE.AmbientLight(0x222222));

  const goldCube = createGoldCube();
  scene.add(goldCube);

  const XZGridPlane = new THREE.GridHelper(1000, 10);
  scene.add(XZGridPlane);

  const YZGridPlane = new THREE.GridHelper(1000, 10);
  YZGridPlane.geometry.rotateZ(Math.PI / 2);
  scene.add(YZGridPlane);

  const axesHelper = new THREE.AxesHelper(200);
  scene.add(axesHelper);

  return scene;
}

function createGoldCube() {
  const cubeSizeLength = 100;
  const goldColor = '#FFDF00';
  const showFrame = true;
  const wireMaterial = new THREE.MeshBasicMaterial({ color: goldColor, wireframe: showFrame });

  const cubeGeometry = new THREE.BoxGeometry(cubeSizeLength, cubeSizeLength, cubeSizeLength);

  const cube = new THREE.Mesh(cubeGeometry, wireMaterial);
  cube.position.x = 0;
  cube.position.y = 0;
  cube.position.z = 0;
  return cube;
}
