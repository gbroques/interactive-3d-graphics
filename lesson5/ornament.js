/* eslint-env browser */
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';

export default class Ornament {
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
  const camera = new THREE.PerspectiveCamera(30, aspectRatio, 1, 10000);
  camera.position.set(-7, 7, 2);
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
  controls.target.set(0, 0, 0);
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

  const cylinderMaterial = new THREE.MeshPhongMaterial({
    color: 0xD1F5FD,
    specular: 0xD1F5FD,
    shininess: 100,
  });

  // get two diagonally-opposite corners of the cube and compute the
  // cylinder axis direction and length
  const maxCorner = new THREE.Vector3(1, 1, 1);
  const minCorner = new THREE.Vector3(-1, -1, -1);
  // note how you can chain one operation on to another:
  const cylinderAxis = new THREE.Vector3().subVectors(maxCorner, minCorner);
  const cylinderLength = cylinderAxis.length();

  // take dot product of cylinderAxis and up vector to get cosine of angle
  cylinderAxis.normalize();
  const theta = Math.acos(cylinderAxis.dot(new THREE.Vector3(0, 1, 0)));
  // or just simply theta = Math.acos( cylinderAxis.y );

  // YOUR CODE HERE
  const cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, cylinderLength, 32), cylinderMaterial,
  );
  const rotationAxis = new THREE.Vector3(1, 0, -1);
  // makeRotationAxis wants its axis normalized
  rotationAxis.normalize();
  // don't use position, rotation, scale
  cylinder.matrixAutoUpdate = false;
  cylinder.matrix.makeRotationAxis(rotationAxis, theta);
  scene.add(cylinder);
  const showBoundingCube = true;
  if (showBoundingCube) {
    const cubeMaterial = new THREE.MeshLambertMaterial(
      { color: 0xFFFFFF, opacity: 0.7, transparent: true },
    );
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2), cubeMaterial,
    );
    scene.add(cube);
  }
  return scene;
}

function range(n) {
  return [...Array(n).keys()];
}
