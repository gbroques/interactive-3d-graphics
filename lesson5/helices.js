/* eslint-env browser */
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';

export default class Helices {
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

  const light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
  light.position.set(200, 400, 500);

  const light2 = new THREE.DirectionalLight(0xFFFFFF, 1.0);
  light2.position.set(-500, 250, -200);

  scene.add(ambientLight);
  scene.add(light);
  scene.add(light2);

  // TEST MATERIALS AND OBJECTS
  const redMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
  const greenMaterial = new THREE.MeshLambertMaterial({ color: 0x00FF00 });
  const blueMaterial = new THREE.MeshLambertMaterial({ color: 0x0000FF });
  const grayMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });

  const yellowMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFF00 });
  const cyanMaterial = new THREE.MeshLambertMaterial({ color: 0x00FFFF });
  const magentaMaterial = new THREE.MeshLambertMaterial({ color: 0xFF00FF });

  const radius = 60;
  const tube = 10;
  const radialSegments = 24;
  const height = 300;
  const segmentsWidth = 12;
  const arc = 2;

  let helix;
  helix = createHelix(
    redMaterial,
    radius,
    tube,
    radialSegments,
    segmentsWidth,
    height,
    arc,
    true,
  );
  helix.name = 'Red';
  helix.position.y = height / 2;
  scene.add(helix);

  helix = createHelix(
    greenMaterial,
    radius / 2,
    tube,
    radialSegments,
    segmentsWidth,
    height,
    arc,
    false,
  );
  helix.name = 'Green';
  helix.position.y = height / 2;
  scene.add(helix);

  // DNA
  helix = createHelix(
    blueMaterial,
    radius,
    tube / 2,
    radialSegments,
    segmentsWidth,
    height,
    arc,
    false,
  );
  helix.name = 'Blue1';
  helix.position.y = height / 2;
  helix.position.z = 2.5 * radius;
  scene.add(helix);

  helix = createHelix(
    blueMaterial,
    radius,
    tube / 2,
    radialSegments,
    segmentsWidth,
    height,
    arc,
    false,
  );
  helix.name = 'Blue2';
  helix.rotation.y = 120 * (Math.PI / 180);
  helix.position.y = height / 2;
  helix.position.z = 2.5 * radius;
  scene.add(helix);

  helix = createHelix(
    grayMaterial,
    radius,
    tube / 2,
    radialSegments,
    segmentsWidth,
    height / 2,
    arc,
    true,
  );
  helix.name = 'Gray';
  helix.position.y = height / 2;
  helix.position.x = 2.5 * radius;
  scene.add(helix);

  helix = createHelix(
    yellowMaterial,
    0.75 * radius,
    tube / 2,
    radialSegments,
    segmentsWidth,
    height,
    4 * arc,
    false,
  );
  helix.name = 'Yellow';
  helix.position.y = height / 2;
  helix.position.x = 2.5 * radius;
  helix.position.z = -2.5 * radius;
  scene.add(helix);

  helix = createHelix(
    cyanMaterial,
    0.75 * radius,
    4 * tube,
    radialSegments,
    segmentsWidth,
    height,
    2 * arc,
    false,
  );
  helix.name = 'Cyan';
  helix.position.y = height / 2;
  helix.position.x = 2.5 * radius;
  helix.position.z = 2.5 * radius;
  scene.add(helix);

  helix = createHelix(
    magentaMaterial,
    radius,
    tube,
    radialSegments,
    segmentsWidth,
    height,
    arc,
    true,
  );
  helix.name = 'Magenta';
  helix.rotation.x = 45 * (Math.PI / 180);
  helix.position.y = height / 2;
  helix.position.z = -2.5 * radius;
  scene.add(helix);
  return scene;
}

/**
* Returns a THREE.Object3D helix going from top to bottom positions
* @param material - THREE.Material
* @param radius - radius of helix itself
* @param tube - radius of tube
* @param radialSegments - number of capsules around a full circle
* @param tubularSegments - tessellation around equator of each tube
* @param height - height to extend, from *center* of tube ends along Y axis
* @param arc - how many times to go around the Y axis; currently just an integer
* @param clockwise - if true, go counterclockwise up the axis
*/
function createHelix(
  material,
  radius,
  tube,
  radialSegments,
  tubularSegments,
  height,
  arc = 1,
  clockwise = true,
) {
  // defaults
  tubularSegments = (tubularSegments === undefined) ? 32 : tubularSegments;

  const helix = new THREE.Object3D();
  const sineSign = clockwise ? 1 : -1;

  const numberOfSpheres = arc * radialSegments + 1;
  const spherePositions = range(numberOfSpheres).map((i) => {
    const position = new THREE.Vector3();
    // going from X to Z axis
    const radians = ((i * 2) * Math.PI) / radialSegments;
    position.set(
      radius * Math.cos(radians),
      height * (i / (arc * radialSegments)) - height / 2,
      sineSign * radius * Math.sin(radians),
    );
    return position;
  });
  const windows = createWindows(spherePositions);
  windows.forEach(([bottom, top], i) => {
    const openBottom = false;
    const openTop = i !== windows.length - 1;
    const capsule = createCapsule(
      material, tube, top, bottom, tubularSegments, openTop, openBottom,
    );
    capsule.name = `Capsule${i}`;
    helix.add(capsule);
  });
  return helix;
}

/**
* Returns a THREE.Object3D cylinder and spheres going from top to bottom positions
* @param material - THREE.Material
* @param radius - the radius of the capsule's cylinder
* @param top, bottom - THREE.Vector3, top and bottom positions of cone
* @param segmentsWidth - tessellation around equator, like radiusSegments in CylinderGeometry
* @param openTop, openBottom - whether the end is given a sphere; true means they are not
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
  // get cylinder height
  const cylAxis = new THREE.Vector3();
  cylAxis.subVectors(top, bottom);
  const length = cylAxis.length();

  // get cylinder center for translation
  const center = new THREE.Vector3();
  center.addVectors(top, bottom);
  center.divideScalar(2.0);

  // always open-ended
  const cylGeom = new THREE.CylinderGeometry(radius, radius, length, segmentsWidth, 1, 1);
  const cyl = new THREE.Mesh(cylGeom, material);

  // pass in the cylinder itself, its desired axis, and the place to move the center.
  makeLengthAngleAxisTransform(cyl, cylAxis, center);

  const capsule = new THREE.Object3D();
  capsule.add(cyl);
  if (!openTop || !openBottom) {
    // instance geometry
    const sphGeom = new THREE.SphereGeometry(radius, segmentsWidth, segmentsWidth / 2);
    if (!openTop) {
      const sphTop = new THREE.Mesh(sphGeom, material);
      sphTop.position.set(top.x, top.y, top.z);
      capsule.add(sphTop);
    }
    if (!openBottom) {
      const sphBottom = new THREE.Mesh(sphGeom, material);
      sphBottom.position.set(bottom.x, bottom.y, bottom.z);
      capsule.add(sphBottom);
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

function range(n) {
  return [...Array(n).keys()];
}

/**
 * @example
 * createWindows([1, 2, 3, 4, 5])
 * [[1, 2], [2, 3], [3, 4], [4, 5]]
 */
function createWindows(array, size = 2) {
  return array
    .reduce((acc, _, index, arr) => {
      if (index + size > arr.length) {
        return acc;
      }
      return acc.concat(
        [arr.slice(index, index + size)],
      );
    }, []);
}
