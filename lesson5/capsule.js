/* eslint-env browser */
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';

export default class Capsule {
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
  const camera = new THREE.PerspectiveCamera(40, aspectRatio, 1, 10000);
  camera.position.set(-528, 513, 92);
  return camera;
}

function createRenderer(width, height) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setSize(width, height);
  return renderer;
}

function createOrbitControls(camera, domElement) {
  const controls = new OrbitControls(camera, domElement);
  controls.target.set(0, 200, 0);
  return controls;
}

function createScene() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x808080, 2000, 4000);

  // LIGHTS
  const ambientLight = new THREE.AmbientLight(0x222222);

  const light = new THREE.DirectionalLight(0xffffff, 1.0);
  light.position.set(200, 400, 500);

  const light2 = new THREE.DirectionalLight(0xffffff, 1.0);
  light2.position.set(-500, 250, -200);

  scene.add(ambientLight);
  scene.add(light);
  scene.add(light2);

  const axes = new THREE.AxesHelper(500);
  axes.name = 'Axes';
  scene.add(axes);

  // TEST MATERIALS AND OBJECTS
  // DO NOT MODIFY FOR GRADING
  const redMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
  const greenMaterial = new THREE.MeshLambertMaterial({ color: 0x00FF00 });
  const blueMaterial = new THREE.MeshLambertMaterial({ color: 0x0000FF });
  const grayMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });

  const yellowMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFF00 });
  const cyanMaterial = new THREE.MeshLambertMaterial({ color: 0x00FFFF });
  const magentaMaterial = new THREE.MeshLambertMaterial({ color: 0xFF00FF });

  const radius = 20;
  const segmentsWidth = 32;
  let capsule;

  // along Y axis
  capsule = createCapsule(greenMaterial,
    radius,
    new THREE.Vector3(0, 300, 0),
    new THREE.Vector3(0, 0, 0),
    segmentsWidth, false, false);
  capsule.name = 'Green';
  scene.add(capsule);

  // along X axis
  capsule = createCapsule(redMaterial,
    radius,
    new THREE.Vector3(300, 0, 0),
    new THREE.Vector3(0, 0, 0),
    segmentsWidth, false, true);
  capsule.name = 'Red';
  scene.add(capsule);

  // along Z axis
  capsule = createCapsule(blueMaterial,
    radius,
    new THREE.Vector3(0, 0, 300),
    new THREE.Vector3(0, 0, 0),
    segmentsWidth, false, true);
  capsule.name = 'Blue';
  scene.add(capsule);

  // along XYZ axis
  capsule = createCapsule(grayMaterial,
    radius,
    new THREE.Vector3(200, 200, 200),
    new THREE.Vector3(0, 0, 0),
    segmentsWidth, false, true);
  capsule.name = 'Gray';
  scene.add(capsule);

  // along -Y axis, translated in XYZ
  capsule = createCapsule(yellowMaterial,
    radius,
    new THREE.Vector3(50, 100, -200),
    new THREE.Vector3(50, 300, -200),
    segmentsWidth, false, true);
  capsule.name = 'Yellow';
  scene.add(capsule);

  // along X axis, from top of previous capsule
  capsule = createCapsule(cyanMaterial,
    radius,
    new THREE.Vector3(50, 300, -200),
    new THREE.Vector3(250, 300, -200),
    segmentsWidth, false, true);
  capsule.name = 'Cyan';
  scene.add(capsule);

  // continue from bottom of previous capsule
  capsule = createCapsule(magentaMaterial,
    radius,
    new THREE.Vector3(250, 300, -200),
    new THREE.Vector3(-150, 100, 0),
    segmentsWidth, false, false);
  capsule.name = 'Magenta';
  scene.add(capsule);
  return scene;
}

/**
* Returns a THREE.Object3D cylinder and spheres going from top to bottom positions
* @param material - THREE.Material
* @param radius - the radius of the capsule's cylinder
* @param top - THREE.Vector3, top position of cone
* @param bottom - THREE.Vector3, bottom position of cone
* @param segmentsWidth - tessellation around equator, like radiusSegments in CylinderGeometry
* @param openTop - whether the end is given a sphere; true means they are not
* @param openBottom - whether the end is given a sphere; true means they are not
*/
function createCapsule(
  material,
  radius,
  top,
  bottom,
  segmentsWidth = 32,
  openTop = false,
  openBottom = false,
) {
  const capsule = new THREE.Group();

  // get cylinder height
  const cylAxis = new THREE.Vector3();
  cylAxis.subVectors(top, bottom);
  const length = cylAxis.length();

  // get cylinder center for translation
  const center = new THREE.Vector3();
  center.addVectors(top, bottom);
  center.divideScalar(2.0);

  // always open-ended
  const cylGeom = new THREE.CylinderGeometry(
    radius, radius, length, segmentsWidth, 1, 1,
  );
  const cyl = new THREE.Mesh(cylGeom, material);
  cyl.name = 'Cylinder';
  // pass in the cylinder itself, its desired axis, and the place to move the center.
  makeLengthAngleAxisTransform(cyl, cylAxis, center);

  capsule.add(cyl);
  if (!openTop || !openBottom) {
    const sphGeom = new THREE.SphereGeometry(
      radius, segmentsWidth, segmentsWidth / 2,
    );
    if (!openTop) {
      const sphere = new THREE.Mesh(sphGeom, material);
      sphere.name = 'TopCap';
      sphere.position.copy(top);
      capsule.add(sphere);
    }
    if (!openBottom) {
      const sphere = new THREE.Mesh(sphGeom, material);
      sphere.name = 'BottomCap';
      sphere.position.copy(bottom);
      capsule.add(sphere);
    }
  }

  return capsule;
}

// Transform cylinder to align with given axis and then move to center
function makeLengthAngleAxisTransform(cyl, cylAxis, center) {
  cyl.matrixAutoUpdate = false;

  // From left to right using frames: translate, then rotate; TR.
  // So translate is first.
  cyl.matrix.makeTranslation(center.x, center.y, center.z);

  // take cross product of cylAxis and up vector to get axis of rotation
  const yAxis = new THREE.Vector3(0, 1, 0);
  // Needed later for dot product, just do it now;
  // a little lazy, should really copy it to a local Vector3.
  cylAxis.normalize();
  const rotationAxis = new THREE.Vector3();
  rotationAxis.crossVectors(cylAxis, yAxis);
  if (rotationAxis.length() < 0.000001) {
    // Special case: if rotationAxis is just about zero, set to X axis,
    // so that the angle can be given as 0 or PI. This works ONLY
    // because we know one of the two axes is +Y.
    rotationAxis.set(1, 0, 0);
  }
  rotationAxis.normalize();

  // take dot product of cylAxis and up vector to get cosine of angle of rotation
  const theta = -Math.acos(cylAxis.dot(yAxis));
  // cyl.matrix.makeRotationAxis( rotationAxis, theta );
  const rotMatrix = new THREE.Matrix4();
  rotMatrix.makeRotationAxis(rotationAxis, theta);
  cyl.matrix.multiply(rotMatrix);
}
