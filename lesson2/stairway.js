/* eslint-env browser */
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/libs/dat.gui.module';

export default class Stairway {
  constructor(options) {
    const {
      rootDomElement,
      width,
      height,
    } = options;

    this._camera = createCamera(width, height);
    this._controller = {};
    this._scene = createScene();
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
  // Camera(2) for testing has following values:
  // camera.position.set( 1225, 2113, 1814 );
  camera.position.set(-700, 500, -1600);
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
  controls.target.set(0, 600, 0);
  // Camera(2) for testing has following values:
  // controls.target.set(-1800,180,630);
  return controls;
}

function createScene(controller) {
  // SCENE
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

  //   scene.add(camera);

  //   if (ground) {
  //     Coordinates.drawGround({ size: 1000 });
  //   }
  //   if (gridX) {
  //     Coordinates.drawGrid({ size: 1000, scale: 0.01 });
  //   }
  //   if (gridY) {
  //     Coordinates.drawGrid({ size: 1000, scale: 0.01, orientation: 'y' });
  //   }
  //   if (gridZ) {
  //     Coordinates.drawGrid({ size: 1000, scale: 0.01, orientation: 'z' });
  //   }
  //   if (axes) {
  //     Coordinates.drawAllAxes({ axisLength: 300, axisRadius: 2, axisTess: 50 });
  //   }
  const [cyl1, cyl2] = createCup();
  scene.add(cyl1);
  scene.add(cyl2);

  const [verticalStepMesh, horizontalStepMesh] = createStairs();
  scene.add(verticalStepMesh);
  scene.add(horizontalStepMesh);

  const axesHelper = new THREE.AxesHelper(20);
  scene.add(axesHelper);

  return scene;
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
  //   gui.add(controller, 'sides', 3, 10, 1);
  return gui;
}

function createStairs() {
  // MATERIALS
  const stepMaterialVertical = new THREE.MeshLambertMaterial({
    color: 0xA85F35,
  });
  const stepMaterialHorizontal = new THREE.MeshLambertMaterial({
    color: 0xBC7349,
  });

  const stepWidth = 500;
  const stepSize = 200;
  const stepThickness = 50;
  // height from top of one step to bottom of next step up
  const verticalStepHeight = stepSize;
  const horizontalStepDepth = stepSize * 2;

  const stepHalfThickness = stepThickness / 2;

  // +Y direction is up
  // Define the two pieces of the step, vertical and horizontal
  // THREE.CubeGeometry takes (width, height, depth)
  const stepVertical = new THREE.BoxGeometry(stepWidth, verticalStepHeight, stepThickness);
  const stepHorizontal = new THREE.BoxGeometry(stepWidth, stepThickness, horizontalStepDepth);

  // Make and position the vertical part of the step
  const verticalStepMesh = new THREE.Mesh(stepVertical, stepMaterialVertical);
  // The position is where the center of the block will be put.
  // You can define position as THREE.Vector3(x, y, z) or in the following way:
  verticalStepMesh.position.x = 0; // centered at origin
  verticalStepMesh.position.y = verticalStepHeight / 2; // half of height: put it above ground plane
  verticalStepMesh.position.z = 0; // centered at origin

  // Make and position the horizontal part
  const horizontalStepMesh = new THREE.Mesh(stepHorizontal, stepMaterialHorizontal);
  horizontalStepMesh.position.x = 0;
  // Push up by half of horizontal step's height, plus vertical step's height
  horizontalStepMesh.position.y = stepThickness / 2 + verticalStepHeight;
  // Push step forward by half the depth, minus half the vertical step's thickness
  horizontalStepMesh.position.z = horizontalStepDepth / 2 - stepHalfThickness;
  return [verticalStepMesh, horizontalStepMesh];
}

function createCup() {
  const cupMaterial = new THREE.MeshLambertMaterial({ color: 0xFDD017 });
  // THREE.CylinderGeometry takes (radiusTop, radiusBottom, height, segmentsRadius)
  let cupGeo = new THREE.CylinderGeometry(200, 50, 400, 32);
  const cyl1 = new THREE.Mesh(cupGeo, cupMaterial);
  cyl1.position.x = 0;
  cyl1.position.y = 1725;
  cyl1.position.z = 1925;
  cupGeo = new THREE.CylinderGeometry(100, 100, 50, 32);
  const cyl2 = new THREE.Mesh(cupGeo, cupMaterial);
  cyl2.position.x = 0;
  cyl2.position.y = 1525;
  cyl2.position.z = 1925;
  return [cyl1, cyl2];
}
