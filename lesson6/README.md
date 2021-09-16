# Lesson 6: Lights

## Photons as Particles

![Photons as Particles](./img/photons-as-particles.png)

* Each light or "*emitter*" sends photons out
* Each photon is absorbed or reflected
  * Every object absorbs some light (even highest quality mirrors)
* Along the way photons can be absorbed by dust, water droplets, or other particles in the air.

This simple photon model ignores various effects such as:

* polarization
* and fluorescence

## Directional Light

* Simplest type of light
* Defined by direction vector
* Like the sun
  * Essentially the same for every object on Earth
  * Infinitely far away
* You manipulate the direction, not location of the light.

```js
const light = new THREE.DirectionalLight(0xFFFFFF, 0.7);
// set direction vector of infinitely far away light
light.position.set(200, 500, 600);
scene.add(light);
```

Length of direction vector doesn't matter.

The following position is equivalent to the above:
```js
light.position.set(2, 5, 6);
light.position.set(0.2, 0.5, 0.6);
```

## Point Light

* Define a position
* Gives off light in all directions
* Different from real world lights in that, by default, distance from light doesn't affect brightness.
* [Attenuation](https://en.wikipedia.org/wiki/Attenuation) is not done, mostly, because it's easier to light a scene if there's no drop-off in distance.
* Possible to use a different equation for how the light is attenuated by the distance.
  * Divide the intensity by the distance
  * Divide the instensity by the distance squared.
  * Three.js supports only 1 drop-off mode. A max distance where the intensity goes to zero. Non-physical, but useful.

## Ambient Light

### General Notes
We don't use a drop-off of intensity by the distance squared because:
* Light only affects what it directly hits.
* No light bouncing around -- it dies off very quickly.

We compensate for this lack of reflected light, called *indirect illumination*, by adding a "fudge factor" -- called *ambient lighting*.


The light color is multiplied by the material's color to give a solid color.

The ambient color on a material is a separate color in Three.js.

If you don't set it, the ambient is white, and ambient light will add gray to the object.

Better to set the ambient to match the diffuse color.

Then use ambient light's intensity to change the feel of the scene as a whole.
```js
const ambientLight = new THREE.AmbientLight(0x222222);

const material = new THREE.MeshLambertMaterial({color: new THREE.Color(0.8, 0.2, 0.2)});
// set the ambient to match the diffuse color
material.ambient.copy(material.color);
```
