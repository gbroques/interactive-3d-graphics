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

  scene.fog = new THREE.Fog(0x808080, 2000, 4000);
  // LIGHTS
  const ambientLight = new THREE.AmbientLight(0x222222);
  const light = new THREE.DirectionalLight(0xffffff, 0.7);
  light.position.set(200, 500, 500);

  const light2 = new THREE.DirectionalLight(0xffffff, 0.7);
  light2.position.set(-200, -100, -400);

  scene.add(ambientLight);
  scene.add(light);
  scene.add(light2);
  const drinkingBirdMeshes = createDrinkingBird();

  drinkingBirdMeshes.forEach((mesh) => {
    scene.add(mesh);
  });

  const axes = new THREE.AxesHelper(600);
  axes.name = 'Axes';
  scene.add(new THREE.AxesHelper(600));

  return scene;
}

// Supporting frame for the bird - base + legs + feet
function createSupport() {
  const legMaterial = new THREE.MeshPhongMaterial({
    color: 0xADA79B,
    shininess: 4,
    specular: new THREE.Color(0.5, 0.5, 0.5),
  });
  const footMaterial = new THREE.MeshPhongMaterial({
    color: 0x960F0B,
    shininess: 30,
    specular: new THREE.Color(0.5, 0.5, 0.5),
  });

  // base
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(
      20 + 64 + 110,
      4,
      2 * 77,
    ), footMaterial,
  );
  base.position.x = -45; // (20+32) - half of width (20+64+110)/2
  base.position.y = 4 / 2; // half of height
  base.position.z = 0; // centered at origin
  base.name = 'Base';

  // left foot
  const footHeight = 52;
  const leftFoot = new THREE.Mesh(
    new THREE.BoxGeometry(
      20 + 64 + 110,
      footHeight,
      6,
    ), footMaterial,
  );
  const leftFootY = 52 / 2;
  leftFoot.position.x = -45; // (20+32) - half of width (20+64+110)/2
  leftFoot.position.y = leftFootY; // half of height
  leftFoot.position.z = 77 + 6 / 2; // offset 77 + half of depth 6/2
  leftFoot.name = 'LeftFoot';

  const leftAnkle = new THREE.Mesh(
    new THREE.BoxGeometry(
      64,
      104 - footHeight,
      6,
    ), footMaterial,
  );
  leftAnkle.position.x = 0; // centered on origin along X
  leftAnkle.position.y = 104 / 2 + (footHeight / 2);
  leftAnkle.position.z = 77 + 6 / 2; // negative offset 77 + half of depth 6/2
  leftAnkle.name = 'LeftAnkle';

  // left leg
  const leftLeg = new THREE.Mesh(
    new THREE.BoxGeometry(
      60,
      334 - footHeight,
      6,
    ), legMaterial,
  );
  leftLeg.position.x = 0; // centered on origin along X
  leftLeg.position.y = 104 + (334 - footHeight) / 2;
  leftLeg.position.z = 77 + 6 / 2; // offset 77 + half of depth 6/2
  leftLeg.name = 'LeftLeg';

  const leftHalfMeshes = [leftFoot, leftAnkle, leftLeg];
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
  const bodyMaterial = new THREE.MeshPhongMaterial({
    color: 0x1F56A9,
    shininess: 100,
    specular: new THREE.Color(0.5, 0.5, 0.5),
  });

  const glassMaterial = new THREE.MeshPhongMaterial({
    color: 0x000000,
    shininess: 100,
    specular: 0xFFFFFF,
    opacity: 0.30,
    transparent: true,
  });

  // body
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(104 / 2, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI), bodyMaterial,
  );
  body.position.x = 0;
  body.position.y = 160;
  body.position.z = 0;
  body.name = 'Body';

  // cap for top of hemisphere
  const bodyCap = new THREE.Mesh(
    new THREE.CylinderGeometry(104 / 2, 104 / 2, 0, 32), bodyMaterial,
  );
  bodyCap.position.x = 0;
  bodyCap.position.y = 160;
  bodyCap.position.z = 0;
  bodyCap.name = 'BodyCap';

  // spine
  const spine = new THREE.Mesh(
    new THREE.CylinderGeometry(12 / 2, 12 / 2, 390 - 100, 32), bodyMaterial,
  );
  spine.position.x = 0;
  spine.position.y = 160 + 390 / 2 - 100;
  spine.position.z = 0;
  spine.name = 'Spine';

  // glass stem
  const glassBody = new THREE.Mesh(
    new THREE.SphereGeometry(116 / 2, 32, 16), glassMaterial,
  );
  glassBody.position.x = 0;
  glassBody.position.y = 160;
  glassBody.position.z = 0;
  glassBody.name = 'GlassBody';

  const glassSpine = new THREE.Mesh(
    new THREE.CylinderGeometry(24 / 2, 24 / 2, 390, 32), glassMaterial,
  );
  glassSpine.position.x = 0;
  glassSpine.position.y = 160 + 390 / 2;
  glassSpine.position.z = 0;
  glassSpine.name = 'GlassSpine';

  return [
    body,
    bodyCap,
    spine,
    glassBody,
    glassSpine,
  ];
}

// Head of the bird - head + hat
function createHead() {
  const headMaterial = new THREE.MeshLambertMaterial({
    color: 0x680105,
  });
  const hatMaterial = new THREE.MeshPhongMaterial({
    color: 0x18264D,
    shininess: 100,
    specular: new THREE.Color(0.5, 0.5, 0.5),
  });

  // head
  const spineYOffset = 160;
  const spineHeight = 390;
  const headDiameter = 104;
  const headRadius = headDiameter / 2;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(headRadius, 32, 16), headMaterial,
  );
  head.name = 'Head';
  const headY = spineYOffset + spineHeight;
  head.position.y = headY;

  // hat brim
  const hatBrimDiameter = 142;
  const hatBrimRadius = hatBrimDiameter / 2;
  const hatBrimHeight = 10;
  const hatBrim = new THREE.Mesh(
    new THREE.CylinderGeometry(hatBrimRadius, hatBrimRadius, hatBrimHeight, 32), hatMaterial,
  );
  hatBrim.name = 'HatBrim';
  const hatBrimYOffset = 40;
  hatBrim.position.y = headY + hatBrimYOffset;

  // hat body
  const hatBodyDiameter = 80;
  const hatBodyRadius = hatBodyDiameter / 2;
  const hatBodyHeight = 70;
  const hatBody = new THREE.Mesh(
    new THREE.CylinderGeometry(hatBodyRadius, hatBodyRadius, hatBodyHeight, 32), hatMaterial,
  );
  hatBody.name = 'HatBody';
  hatBody.position.y = headY + headRadius;

  const [leftEye, rightEye] = createEyes();

  const nose = createNose(headMaterial);

  return [
    head,
    hatBrim,
    hatBody,
    leftEye,
    rightEye,
    nose,
  ];
}

function createDrinkingBird() {
  // MODELS
  // base + legs + feet
  const supportMeshes = createSupport();

  // body + body/head connector
  const bodyMeshes = createBody();

  // head + hat
  const headMeshes = createHead();

  const crossbar = createCrossbar();

  return supportMeshes
    .concat(bodyMeshes)
    .concat(headMeshes)
    .concat([crossbar]);
}

function createCrossbar() {
  const radius = 5;
  const length = 200;
  const geometry = new THREE.CylinderGeometry(
    radius, radius, length, 32,
  );
  const material = new THREE.MeshPhongMaterial({
    color: 0x808080,
    specular: 0xFFFFFF,
    shininess: 400,
  });
  const crossbar = new THREE.Mesh(geometry, material);
  crossbar.name = 'Crossbar';
  crossbar.position.y = 360;
  crossbar.rotation.x = 90 * (Math.PI / 180);
  return crossbar;
}

function createEyes() {
  const radius = 10;
  const geometry = new THREE.SphereGeometry(radius, 32, 16);
  const material = new THREE.MeshPhongMaterial({
    color: 0x000000,
    specular: 0x303030,
    shininess: 4,
  });
  const rightEye = createEye(geometry, material, 20);
  const leftEye = createEye(geometry, material, -20);
  return [rightEye, leftEye];
}

function createEye(geometry, material, yRotation) {
  const eye = new THREE.Group();
  eye.name = 'Eye';
  eye.rotation.y = yRotation * (Math.PI / 180);
  const sphere = new THREE.Mesh(geometry, material);
  sphere.name = 'Sphere';
  sphere.position.x = -48;
  sphere.position.y = 560;
  eye.add(sphere);
  return eye;
}

function createNose(material) {
  const radiusTop = 6;
  const radiusBottom = 14;
  const height = 70;
  const geometry = new THREE.CylinderGeometry(
    radiusTop, radiusBottom, height, 32,
  );
  const nose = new THREE.Mesh(geometry, material);
  nose.name = 'Nose';
  nose.position.x = -70;
  nose.position.y = 530;
  nose.rotation.z = 90 * (Math.PI / 180);
  return nose;
}
