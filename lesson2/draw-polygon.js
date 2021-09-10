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
    this._controller = {
      sides: 5,
      cx: 0,
      cy: 0,
      radius: 1,
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
    if (!areObjectsDifferent(this._controller, this._previousController)) {
      const {
        sides, cx, cy, radius,
      } = this._controller;
      const center = [cx, cy];
      const polygonMesh = this._scene.getObjectByName('polygon');
      polygonMesh.geometry = drawPolygon(sides, center, radius);
    }
    this._previousController = { ...this._controller };

    this._renderer.render(this._scene, this._camera);
  }
}

function areObjectsDifferent(a, b = {}) {
  return (
    Object.keys(a).length !== Object.keys(b).length
    && Object.keys(a).every((key) => a[key] !== b[key])
  );
}

function createCamera() {
  const size = 30;
  // Camera frustum planes
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

function createScene(controller) {
  const {
    sides, cx, cy, radius,
  } = controller;
  const center = [cx, cy];
  const scene = new THREE.Scene();
  // LIGHTS
  scene.add(new THREE.AmbientLight(0x222222));

  const material = new THREE.MeshBasicMaterial({
    color: 0xF6831E,
    side: THREE.DoubleSide,
  });
  const polygonGeometry = drawPolygon(sides, center, radius);
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
function drawPolygon(sides, center = [0, 0], radius = 1) {
  const [cx, cy] = center;
  const geometry = new THREE.BufferGeometry();

  const vertices = range(sides).map((point) => {
    // Add 90 degrees so we start at +Y axis, rotate counterclockwise around
    const angle = (Math.PI / 2) + (point / sides) * 2 * Math.PI;

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return [x + cx, y + cy, 0];
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

function createGUI(controller) {
  const gui = new GUI({ autoPlace: false });
  gui.closed = false;
  gui.add(controller, 'sides', 3, 10, 1)
    .name('Sides');
  gui.add(controller, 'cx', -10, 10, 1)
    .name('Center X');
  gui.add(controller, 'cy', -10, 10, 1)
    .name('Center Y');
  gui.add(controller, 'radius', 1, 5, 1)
    .name('Radius');
  return gui;
}
