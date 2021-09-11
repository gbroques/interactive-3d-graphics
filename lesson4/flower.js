/* eslint-env browser */
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';

export default class Flower {
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

    this._render();
    this._animate();
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
  const aspectRatio = width / height;
  const camera = new THREE.PerspectiveCamera(38, aspectRatio, 1, 10000);
  camera.position.set(-200, 400, 20);
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
  controls.target.set(0, 150, 0);
  return controls;
}

function createScene() {
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

  // FLOWER
  const petalMaterial = new THREE.MeshLambertMaterial({ color: 0xCC5920 });
  const flowerHeight = 200;
  const petalLength = 120;
  const radiusTop = 15;
  const radiusBottom = 0;
  const radialSegments = 32;
  const cylinderGeometry = new THREE.CylinderGeometry(
    radiusTop, radiusBottom, petalLength, radialSegments,
  );
  const flower = new THREE.Object3D();
  flower.name = 'Flower';

  const petalGroup = new THREE.Object3D();
  petalGroup.name = 'Petals';
  flower.add(petalGroup);

  const numberOfPetals = 24;
  const petals = range(numberOfPetals).map((n) => {
    const cone = new THREE.Mesh(cylinderGeometry, petalMaterial);
    cone.scale.x = 0.25;
    cone.position.y = petalLength / 2;
    cone.name = 'Cone';

    const petal = new THREE.Object3D();
    petal.name = `Petal${n}`;
    const angle = (360 / numberOfPetals) * n;
    petal.rotation.y = THREE.MathUtils.degToRad(angle);
    const tiltAngle = 20;
    petal.rotation.z = THREE.MathUtils.degToRad(90 - tiltAngle);
    petal.position.y = flowerHeight;

    petal.add(cone);

    return petal;
  });

  petals.forEach((petal) => {
    petalGroup.add(petal);
  });

  const stamenMaterial = new THREE.MeshLambertMaterial({ color: 0x333310 });
  const stamen = new THREE.Mesh(
    new THREE.SphereGeometry(20, 32, 16), stamenMaterial,
  );
  stamen.name = 'Stamen';
  stamen.position.y = flowerHeight; // move to flower center
  flower.add(stamen);

  const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x339424 });
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(10, 10, flowerHeight, 32), stemMaterial,
  );
  stem.name = 'Stem';
  stem.position.y = flowerHeight / 2; // move from ground to stamen
  flower.add(stem);

  scene.add(flower);

  const axes = new THREE.AxesHelper(300);
  axes.name = 'Axes';
  scene.add(axes);

  return scene;
}

function range(n) {
  return [...Array(n).keys()];
}
