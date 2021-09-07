/* eslint-env browser */
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';

export default class DrinkingBird {
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
  const far = 40000;
  const camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    near,
    far,
  );
  camera.position.set(-480, 659, -619);
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
  controls.target.set(4, 301, 92);
  return controls;
}

function createScene() {
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
  const drinkingBirdMeshes = createDrinkingBird();

  drinkingBirdMeshes.forEach((mesh) => {
    scene.add(mesh);
  });

  scene.add(new THREE.AxesHelper(600));

  return scene;
}

// Supporting frame for the bird - base + legs + feet
function createSupport() {
  const baseMaterial = new THREE.MeshLambertMaterial({ color: 0xF07020 });
  const legMaterial = new THREE.MeshPhongMaterial({
    color: 0xF07020,
    shininess: 4,
    specular: new THREE.Color(0.5, 0.5, 0.5),
  });
  const footMaterial = new THREE.MeshPhongMaterial({
    color: 0xF07020,
    shininess: 30,
    specular: new THREE.Color(0.5, 0.5, 0.5),
  });
  // base
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(20 + 64 + 110, 4, 2 * 77), baseMaterial,
  );
  base.position.x = -45; // (20+32) - half of width (20+64+110)/2
  base.position.y = 4 / 2; // half of height
  base.position.z = 0; // centered at origin
  base.name = 'Base';

  // left foot
  const leftFoot = new THREE.Mesh(
    new THREE.BoxGeometry(20 + 64 + 110, 52, 6), legMaterial,
  );
  leftFoot.position.x = -45; // (20+32) - half of width (20+64+110)/2
  leftFoot.position.y = 52 / 2; // half of height
  leftFoot.position.z = 77 + 6 / 2; // offset 77 + half of depth 6/2
  leftFoot.name = 'LeftFoot';

  // left leg
  const leftLeg = new THREE.Mesh(
    new THREE.BoxGeometry(64, 334 + 52, 6), footMaterial,
  );
  leftLeg.position.x = 0; // centered on origin along X
  leftLeg.position.y = (334 + 52) / 2;
  leftLeg.position.z = 77 + 6 / 2; // offset 77 + half of depth 6/2
  leftLeg.name = 'LeftLeg';

  const leftHalfMeshes = [leftFoot, leftLeg];
  const rightHalfMeshes = leftHalfMeshes.map((leftHalfMesh) => {
    const rightHalfMesh = leftHalfMesh.clone();
    rightHalfMesh.name = leftHalfMesh.name.replace('Left', 'Right');
    rightHalfMesh.position.z *= -1;
    return rightHalfMesh;
  });
  return [
    base,
    ...leftHalfMeshes,
    ...rightHalfMeshes,
  ];
}

// Body of the bird - body and the connector of body and head
function createBody() {
  const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xA00000 });
  const cylinderMaterial = new THREE.MeshPhongMaterial({
    color: 0x0000D0,
    shininess: 100,
    specular: new THREE.Color(0.5, 0.5, 0.5),
  });

  // spine
  const spineHeight = 390;
  const spineDiameter = 24;
  const spineRadius = spineDiameter / 2;
  const spine = new THREE.Mesh(
    new THREE.CylinderGeometry(spineRadius, spineRadius, spineHeight, 32), cylinderMaterial,
  );
  const baseThickness = 4;
  const spineYOffset = 160;
  const spineY = (spineHeight / 2) + baseThickness + spineYOffset;
  spine.position.y = spineY;
  spine.name = 'Spine';

  // body
  const bodyDiameter = 116;
  const bodyRadius = bodyDiameter / 2;
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(bodyRadius, 32, 16), sphereMaterial,
  );
  body.name = 'Body';
  body.position.y = spineYOffset;

  return [spine, body];
}

// Head of the bird - head + hat
function createHead() {
  const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xA00000 });
  const cylinderMaterial = new THREE.MeshPhongMaterial({
    color: 0x0000D0,
    shininess: 100,
    specular: new THREE.Color(0.5, 0.5, 0.5),
  });

  // head
  const spineYOffset = 160;
  const spineHeight = 390;
  const headDiameter = 104;
  const headRadius = headDiameter / 2;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(headRadius, 32, 16), sphereMaterial,
  );
  head.name = 'Head';
  const headY = spineYOffset + spineHeight;
  head.position.y = headY;

  // hat brim
  const hatBrimDiameter = 142;
  const hatBrimRadius = hatBrimDiameter / 2;
  const hatBrimHeight = 10;
  const hatBrim = new THREE.Mesh(
    new THREE.CylinderGeometry(hatBrimRadius, hatBrimRadius, hatBrimHeight, 32), cylinderMaterial,
  );
  hatBrim.name = 'HatBrim';
  const hatBrimYOffset = 40;
  hatBrim.position.y = headY + hatBrimYOffset;

  // hat body
  const hatBodyDiameter = 80;
  const hatBodyRadius = hatBodyDiameter / 2;
  const hatBodyHeight = 70;
  const hatBody = new THREE.Mesh(
    new THREE.CylinderGeometry(hatBodyRadius, hatBodyRadius, hatBodyHeight, 32), cylinderMaterial,
  );
  hatBody.name = 'HatBody';
  hatBody.position.y = headY + headRadius;

  return [head, hatBrim, hatBody];
}

function createDrinkingBird() {
  // MODELS
  // base + legs + feet
  const supportMeshes = createSupport();

  // body + body/head connector
  const bodyMeshes = createBody();

  // head + hat
  const headMeshes = createHead();
  return supportMeshes
    .concat(bodyMeshes)
    .concat(headMeshes);
}
