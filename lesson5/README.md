# Lesson 5: Matrices

## Matrix Math
To multiply a coordinate by a matrix, you perform a [**dot product** ](https://en.wikipedia.org/wiki/Dot_product)between the coordinate and each row in the matrix.

## The Fourth Coordinate

* **Point** - (x, y, z, **1**)
* **Vector** - (x, y, z, **0**)

|Binary Operation|Operand A|Operand B|Result|Fourth Coordinate|
|---|---|---|---|---|
|Addition|Vector|Vector|Vector|0 + 0 = 0|
|Subtraction|Vector|Vector|Vector|0 - 0 = 0|
|Addition|Point|Vector|Point|1 + 0 = 1|
|Subtraction|Point|Point|Vector|1 - 1 = 0|
|Addition|Point|Point|**Illegal!**|1 + 1 = 2|

## Identity Matrix
Usual default setting for a matrix.

Matrix with zeroes everywhere, and ones along the diagonal.

When multiplied with a coordinate, always results in the coordinate itself.

```js
const matrix = new THREE.Matrix4();

// reset matrix to identity
matrix.identity();
```

## Translation Matrix
Like an identity matrix, but translation movement is in the top 3 positions of the fourth column.
```
1 0 0 Tx
0 1 0 Ty
0 0 1 Tz
0 0 0 1
```
In **Column-Major Form**.

There is also *row-major form*.

WebGL and most publications use Column-Major form.

In memory:
```
1 0 0 0 0 1 0 0 0 0 1 0 Tx Ty Tz 1
```

(*same in WebGL & DirectX*)

## Using a Matrix
```js
const matrix = new THREE.Matrix4(
    1, 0, 0, 12,
    0, 1, 0, 16,
    0, 0, 1, -5,
    0, 0, 0, 1,
);
```
(*stored in memory differently*)

```js
const matrix = new THREE.Matrix4();
matrix.makeTranslation(x, y, z);
object3d.matrix = matrix;
// Don't use .position .rotation and .scale!
object3d.matrixAutoUpdate = false;
```

## Rotation Matrix

Rz
```
  cos(θ) -sin(θ)       0       0
  sin(θ)  cos(θ)       0       0
  0       0            1       0
  0       0            0       1
```

Third row is `(0, 0, 1, 0)` leaving Z-values unchanged during rotation about the Z-axis.

Two ways of thinking about it:

1. Rotating a point about the world axes
2. Rotating the world axes to local axes, and see where point lies with respect to local axis.
    * A dot product between two normalized vectors gives us the cosine of the angle between them.

Both interpretations are correct and have their own strengths.

## Basis

* Transformed world axes, or local axes are known as a **basis**.

## Axis-Angle Representation

```js
const matrix = new THREE.Matrix4();
matrix.makeRotationAxis(axis, theta);
```

![Axis of Rotation Cube](./img/axis-of-rotation-cube.png)

![Axis of Rotation Cube Cylinder](./img/axis-of-rotation-cube-cylinder.png)

```js
// better name might be Coordinate3
// to differentiate between Point and Vector
const maxCorner = new THREE.Vector3(1, 1, 1);
const minCorner = new THREE.Vector3(-1, -1, -1);
const cylinderAxis = new THREE.Vector3();
cylinderAxis.subVectors(maxCorner, minCorner);
const cylinderLength = cylinderAxis.length();

cylinderAxis.normalize();
// could use cylinderAxis.y instead of new THREE.Vector3(0, 1, 0) for performance
const theta = cylinderAxis = Math.acos(
    cylinderAxis.dot(new THREE.Vector3(0, 1, 0))
);
```

> Negate and try again

## Cross Product
A [**cross product**](https://en.wikipedia.org/wiki/Cross_product) can compute the axis of rotation.

```js
const rotationAxis = new THREE.Vector3();
rotationAxis.crossVectors(cylinderAxis, new THREE.Vector3(0, 1, 0));

// negative rotation axis
rotationAxis.crossVectors(new THREE.Vector3(0, 1, 0), cylinderAxis);

// special case
// two vectors are:
// 1) pointing in the same direction
// 2) or point in opposite directions
if (rotationAxis.length() == 0) {
    // pick an arbitrary axis perpendicular to axis of rotation
    // x axis is perpendicular to y axis
    rotationAxis.set(1, 0, 0);
}
```

**Additional Reading:** [Efficiently Building a Matrix to Rotate One Vector to Another](http://cs.brown.edu/research/pubs/pdfs/1999/Moller-1999-EBA.pdf)

The above paper can solve this problem in a *general way*.

Given a **vector** `A` and `B`:
```
A = (Ax, Ay, Az)
B = (Bx, By, Bz)
```

The length of the vector resulting from the cross-product between these vectors is:
```
Length(A X B) = sin(θ) * Length(A) * Length(B)
```

Where:
```
A X B = (AyBz - AzBy, AzBx - AxBz, AxBy - AyBx)
```

1. top left, to bottom right, *minus*
2. top rigth, to bottom left

New computed vector:
* describes the axis of rotation between the two vectors
* is perpendicular to both vectors
* typically want to normalize this vector if you use it late as it's length is usually obscure
