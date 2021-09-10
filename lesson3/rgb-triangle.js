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
    this._animationFrameRequestId = window.requestAnimationFrame(() => this._animate());
  }

  cleanUp() {
    this._scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.material.dispose();
        object.geometry.dispose();
      }
    });
    window.cancelAnimationFrame(this._animationFrameRequestId);
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
