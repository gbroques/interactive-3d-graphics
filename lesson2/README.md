# Lesson 2: Points, Vectors, and Meshes

## Points & Vectors

Points - A Location in Space
  * Must be defined with respect to something else.
Vector - Direction in Space

### Cartesian Coordinate System
* Origin - Some fixed location that everyone agrees on.
* 3 Direction Vectors, X, Y, and Z
    * Typically perpendicular to each other.

Points in space are defined with a triplet of numbers, (x, y, z)

Vectors describe motion. Also defined with a triplet of numbers (x, y, z).
Origin is not needed. How far to move from one point to another.
Not fixed in any particular location.

A specific time is like a point. An amount of time is like a vector.
Duration is given, but no starting time.

## Left Handed vs. Right Handed

### Right Handed
* X Axis - Thumb along X Axis
* Y Axis - Index Finger along Y Axis
* Z Axis - Middle Fingler along Z Axis (comes out towards the viewer)

### Left Handed
* X Axis - Thumb along X Axis
* Y Axis - Index Finder along Y Axis
* Z Axis - Middle Fingler along Z Axis (reaches back into the page)

To convert between the two systems, negate the Z Axis.

## 3 GPU Primitives

1. Points - **1** (x, y, z) triplet ⚈
     1. **0** dimensions
2. Line Segments - **2** (x, y, z) triplets 📏
     1. **1** dimension
3. Triangles (*most important*) - **3** (x, y, z) triplets 🔺
     1. **2** dimensions

We care about representing how light reflects off an object's surface, rather than representing a solid volume.

Hence, 2 dimensions is as far as the GPU models for 3 dimensions.
