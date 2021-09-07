/* eslint-env browser */
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';

export default class RGBTriangle {
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
  const left = -size;
  const right = size;
  const top = size;
  const bottom = -size;
  const near = 0;
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

  const triangleMaterial = new THREE.MeshBasicMaterial({
    vertexColors: THREE.VertexColors,
    side: THREE.DoubleSide,
  });

  const triangleGeometry = createTriangleGeometry();
  const triangleMesh = new THREE.Mesh(triangleGeometry, triangleMaterial);
  scene.add(triangleMesh);

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
 * Draw a triangle.
 * @returns {BufferGeometry} Triangle geometry.
 */
function createTriangleGeometry() {
  const geometry = new THREE.BufferGeometry();

  const vertices = [
    // bottom left
    0, 0, 0,
    // bottom right
    4, 0, 0,
    // top point
    2, 3, 0,
  ];
  const indices = [0, 1, 2];

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3),
  );
  geometry.setIndex(indices);

  const colors = new Uint8Array([
    255, 0, 0,
    0, 255, 0,
    0, 0, 255,
  ]);

  const normalizeArray = true;
  geometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colors, 3, normalizeArray),
  );

  return geometry;
}

// /// /////////////////////////////////////////////////////////////////////////////
// /* global THREE, window, document */
// let camera; let scene; let
//   renderer;
// let cameraControls;
// const clock = new THREE.Clock();

// function fillScene() {
//   scene = new THREE.Scene();

//   // Triangle Mesh
//   let material; let geometry; let
//     mesh;
//   material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors, side: THREE.DoubleSide });
//   geometry = new THREE.Geometry();

//   // Student: add a colored triangle here

//   mesh = new THREE.Mesh(geometry, material);

//   scene.add(mesh);
// }

// function init() {
//   const canvasWidth = 846;
//   const canvasHeight = 494;
//   const canvasRatio = canvasWidth / canvasHeight;

//   // RENDERER
//   renderer = new THREE.WebGLRenderer({ antialias: true });
//   renderer.gammaInput = true;
//   renderer.gammaOutput = true;
//   renderer.setSize(canvasWidth, canvasHeight);
//   renderer.setClearColorHex(0xAAAAAA, 1.0);

//   // CAMERA
//   camera = new THREE.PerspectiveCamera(55, canvasRatio, 1, 4000);
//   camera.position.set(100, 150, 130);

//   // CONTROLS
//   cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
//   cameraControls.target.set(0, 0, 0);
// }

// function addToDOM() {
//   const container = document.getElementById('container');
//   const canvas = container.getElementsByTagName('canvas');
//   if (canvas.length > 0) {
//     container.removeChild(canvas[0]);
//   }
//   container.appendChild(renderer.domElement);
// }

// function animate() {
//   window.requestAnimationFrame(animate);
//   render();
// }

// function render() {
//   const delta = clock.getDelta();
//   cameraControls.update(delta);

//   renderer.render(scene, camera);
// }

// try {
//   init();
//   fillScene();
//   addToDOM();
//   animate();
// } catch (e) {
//   const errorReport = 'Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>';
//   $('#container').append(errorReport + e);
// }
