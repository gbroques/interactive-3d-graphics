/* eslint-env browser */
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/libs/dat.gui.module';

export default class RobotArm {
  constructor(options) {
    const {
      rootDomElement,
      width,
      height,
    } = options;

    this._camera = createCamera(width, height);
    this._controller = {
      bodyY: 0.0,

      upperArmY: 70.0,
      upperArmZ: -15.0,

      forearmY: 10.0,
      forearmZ: 60.0,

      handZ: 30.0,
      handSpread: 12.0,
    };

    const bodyLength = 60;
    const upperArmLength = 120;
    const forearmLength = 80;
    const [rightHand, leftHand] = createHands(forearmLength);
    this._robot = {
      base: createBase(),
      body: createBody(bodyLength),
      upperArm: createUpperArm(upperArmLength, bodyLength),
      forearm: createForearm(forearmLength, upperArmLength),
      rightHand,
      leftHand,
    };
    this._robot.body.add(this._robot.upperArm);
    this._robot.upperArm.add(this._robot.forearm);
    this._robot.forearm.add(this._robot.rightHand);
    this._robot.forearm.add(this._robot.leftHand);

    const robotGroup = new THREE.Group();
    robotGroup.name = 'Robot';
    robotGroup.add(this._robot.base);
    robotGroup.add(this._robot.body);

    this._scene = createScene(robotGroup);
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
    this._robot.body.rotation.y = this._controller.bodyY * (Math.PI / 180);

    this._robot.upperArm.rotation.y = this._controller.upperArmY * (Math.PI / 180);
    this._robot.upperArm.rotation.z = this._controller.upperArmZ * (Math.PI / 180);

    this._robot.forearm.rotation.y = this._controller.forearmY * (Math.PI / 180);
    this._robot.forearm.rotation.z = this._controller.forearmZ * (Math.PI / 180);

    this._robot.leftHand.rotation.z = this._controller.handZ * (Math.PI / 180);
    this._robot.leftHand.position.z = this._controller.handSpread;

    this._robot.rightHand.rotation.z = this._controller.handZ * (Math.PI / 180);
    this._robot.rightHand.position.z = -this._controller.handSpread;

    this._renderer.render(this._scene, this._camera);
  }
}

function createCamera(width, height) {
  const aspectRatio = width / height;
  const camera = new THREE.PerspectiveCamera(38, aspectRatio, 1, 10000);
  camera.position.set(-102, 177, 20);
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
  controls.target.set(-13, 60, 2);
  return controls;
}

function createScene(robotGroup) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x808080, 2000, 4000);

  // LIGHTS
  const ambientLight = new THREE.AmbientLight(0x222222);
  const light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
  light.position.set(200, 400, 500);
  const light2 = new THREE.DirectionalLight(0xFFFFFF, 1.0);
  light2.position.set(-500, 250, -200);
  scene.add(ambientLight);
  scene.add(light);
  scene.add(light2);

  scene.add(robotGroup);

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
  gui.add(controller, 'bodyY', -180.0, 180.0, 0.025)
    .name('Body Y');
  gui.add(controller, 'upperArmY', -180.0, 180.0, 0.025)
    .name('Upper Arm Y');
  gui.add(controller, 'upperArmZ', -45.0, 45.0, 0.025)
    .name('Upper Arm Z');
  gui.add(controller, 'forearmY', -180.0, 180.0, 0.025)
    .name('Forearm Y');
  gui.add(controller, 'forearmZ', -120.0, 120.0, 0.025)
    .name('Forearm Z');
  gui.add(controller, 'handZ', -45.0, 45.0, 0.025).name('Hand Z');
  gui.add(controller, 'handSpread', 2.0, 17.0, 0.025).name('Hand Spread');
  return gui;
}

function createForearm(length, y) {
  const forearm = new THREE.Object3D();
  forearm.name = 'Forearm';
  forearm.position.y = y;
  const material = new THREE.MeshPhongMaterial({
    color: 0xF4C154,
    specular: 0xF4C154,
    shininess: 100,
  });

  let cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(22, 22, 6, 32), material,
  );
  forearm.add(cylinder);

  const numberOfBoxes = 4;
  const boxes = range(numberOfBoxes).map((i) => {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(4, length, 4), material,
    );
    box.position.x = (i < 2) ? -8 : 8;
    box.position.y = length / 2;
    box.position.z = (i % 2) ? -8 : 8;
    return box;
  });
  boxes.forEach((box) => {
    forearm.add(box);
  });

  cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(15, 15, 40, 32), material,
  );
  cylinder.rotation.x = 90 * (Math.PI / 180);
  cylinder.position.y = length;
  forearm.add(cylinder);

  return forearm;
}

function range(n) {
  return [...Array(n).keys()];
}

function createUpperArm(length, y) {
  const upperArm = new THREE.Object3D();
  upperArm.name = 'UpperArm';
  upperArm.position.y = y;
  const material = new THREE.MeshPhongMaterial({
    color: 0x95E4FB,
    specular: 0x95E4FB,
    shininess: 100,
  });
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(18, length, 18), material,
  );
  box.position.y = length / 2;
  upperArm.add(box);

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(20, 32, 16), material,
  );
  // place sphere at end of arm
  sphere.position.y = length;
  upperArm.add(sphere);
  return upperArm;
}

function createBase() {
  const geometry = new THREE.TorusGeometry(22, 15, 32, 32);
  const material = new THREE.MeshPhongMaterial({
    color: 0x6E23BB,
    specular: 0x6E23BB,
    shininess: 20,
  });
  const base = new THREE.Mesh(geometry, material);
  base.name = 'Base';
  base.rotation.x = 90 * (Math.PI / 180);
  return base;
}

function createBody(length) {
  const body = new THREE.Object3D();
  body.name = 'Body';
  const material = new THREE.MeshPhongMaterial({
    color: 0x279933,
    specular: 0x279933,
    shininess: 100,
  });
  let cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(50, 12, length / 2, 18), material,
  );
  cylinder.position.y = length / 4;
  body.add(cylinder);

  cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(12, 50, length / 2, 18), material,
  );
  cylinder.position.y = (3 * length) / 4;
  body.add(cylinder);

  const box = new THREE.Mesh(
    new THREE.BoxGeometry(12, length / 4, 110), material,
  );
  box.position.y = length / 2;
  body.add(box);

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(20, 32, 16), material,
  );
  // place sphere at end of arm
  sphere.position.y = length;
  body.add(sphere);

  return body;
}

function createHands(y) {
  const length = 38;
  const geometry = new THREE.BoxGeometry(30, length, 4);

  const rightHandMaterial = new THREE.MeshPhongMaterial({
    color: 0xDD3388,
    specular: 0xDD3388,
    shininess: 20,
  });
  const rightHand = createHand(geometry, rightHandMaterial, y, length);

  const leftHandMaterial = new THREE.MeshPhongMaterial({
    color: 0xCC3399,
    specular: 0xCC3399,
    shininess: 20,
  });
  const leftHand = createHand(geometry, leftHandMaterial, y, length);

  return [rightHand, leftHand];
}

function createHand(geometry, material, y, length) {
  const hand = new THREE.Object3D();
  // Move the hand part to the end of the forearm.
  hand.position.y = y;

  const box = new THREE.Mesh(
    geometry, material,
  );
  box.position.y = length / 2;
  hand.add(box);
  return hand;
}
