/* eslint-env browser */
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';

export default class DrawSquare {
  constructor(options) {
    const {
      rootDomElement,
      width,
      height,
    } = options;

    this._camera = createCamera();
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

function createCamera() {
  const size = 30;
  // Camera frustum left plane.
  const left = -size;
  // Camera frustum right plane.
  const right = size;
  // Camera frustum top plane.
  const top = size;
  // Camera frustum bottom plane.
  const bottom = -size;
  // Camera frustum near plane.
  const near = 0;
  // Camera frustum far plane.
  const far = size * 2;

  const camera = new THREE.OrthographicCamera(
    left,
    right,
    top,
    bottom,
    near,
    far,
  );

  const focus = new THREE.Vector3(5, 5, 0);
  camera.position.x = focus.x;
  camera.position.y = focus.y;
  camera.position.z = 20;
  camera.lookAt(focus);

  return camera;
}

function createRenderer(width, height) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setSize(width, height);
  renderer.setClearColor(0xffffff, 1.0);
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

  const squareMaterial = new THREE.MeshBasicMaterial({
    color: 0xF6831E,
    side: THREE.DoubleSide,
  });
  const squareGeometry = drawSquare([1, 1], [6, 6]);
  const squareMesh = new THREE.Mesh(squareGeometry, squareMaterial);
  scene.add(squareMesh);

  const size = 20;
  const divisions = 20;
  const grid = new THREE.GridHelper(size, divisions);
  grid.geometry.rotateX(Math.PI / 2);

  scene.add(grid);

  const axesHelper = new THREE.AxesHelper(20);
  scene.add(axesHelper);

  return scene;
}

/**
 * Draw a square from two points.
 *
 * @link https://threejsfundamentals.org/threejs/lessons/threejs-custom-buffergeometry.html
 *
 * @param {Array} p1 bottom right
 * @param {Array} p2 top right
 * @returns {BufferGeometry} Square geometry.
 */
function drawSquare(p1, p2) {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  const geometry = new THREE.BufferGeometry();

  const vertices = [
    // bottom left
    x1, y1, 0,
    // bottom right
    x2, y1, 0,
    // top left
    x1, y2, 0,
    // top right
    x2, y2, 0,
  ];
  const indices = [
    // bottom right triangle
    0, 1, 3,
    // top right triangle
    2, 3, 0,
  ];

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3),
  );
  geometry.setIndex(indices);

  return geometry;
}
