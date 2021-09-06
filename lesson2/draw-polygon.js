/* eslint-env browser */
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/libs/dat.gui.module';

export default class DrawPolygon {
  constructor(options) {
    const {
      rootDomElement,
      width,
      height,
    } = options;

    this._camera = createCamera();
    this._sidesController = { sides: 5 };
    this._scene = createScene(this._sidesController.sides);
    this._renderer = createRenderer(width, height);
    this._orbitControls = createOrbitControls(this._camera, this._renderer.domElement);

    this._animate();

    const gui = createGUI(this._sidesController);
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
    if (this._previousSides !== this._sidesController.sides) {
      const polygonMesh = this._scene.getObjectByName('polygon');
      polygonMesh.geometry = drawPolygon(this._sidesController.sides, 10);
    }
    this._previousSides = this._sidesController.sides;

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

function createScene(sides) {
  const scene = new THREE.Scene();
  // LIGHTS
  scene.add(new THREE.AmbientLight(0x222222));

  const material = new THREE.MeshBasicMaterial({
    color: 0xF6831E,
    side: THREE.DoubleSide,
  });
  const polygonGeometry = drawPolygon(sides, 10);
  const polygonMesh = new THREE.Mesh(polygonGeometry, material);
  polygonMesh.name = 'polygon';
  scene.add(polygonMesh);

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
 * Draw a polygon with N sides centered at origin.
 *
 * @link http://blog.cjgammon.com/threejs-geometry
 *
 * @param {number} sides number of sides
 * @returns {BufferGeometry} Square geometry.
 */
function drawPolygon(sides, size = 1) {
  const geometry = new THREE.BufferGeometry();

  const vertices = range(sides).map((point) => {
    // Add 90 degrees so we start at +Y axis, rotate counterclockwise around
    const angle = (Math.PI / 2) + (point / sides) * 2 * Math.PI;

    const x = Math.cos(angle) * size;
    const y = Math.sin(angle) * size;
    return [x, y, 0];
  });

  const mininumNumberOfTriangles = sides - 2;

  // create a triangle fan from the zeroth point
  const indices = range(mininumNumberOfTriangles)
    .map((n) => [0, n + 1, n + 2]).flat();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices.flat(), 3),
  );
  geometry.setIndex(indices);

  return geometry;
}

function range(n) {
  return [...Array(n).keys()];
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

function createGUI(sidesController) {
  const gui = new GUI({ autoPlace: false });
  gui.closed = false;
  gui.add(sidesController, 'sides', 3, 10, 1);
  return gui;
}
