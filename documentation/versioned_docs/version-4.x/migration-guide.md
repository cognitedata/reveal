---
id: migration-guide
title: Migrating from Reveal 3 to 4
hide_title: true
description: This page describes the differences between Reveal 3 and 4.
---

This document is an overview of some important differences between Reveal 3.x and Reveal 4.x.

## Entrypoint and import paths
For Reveal 4 we changed into using a single entry point for everything: `@cognite/reveal`.
So extensions and tools also should be imported from this entry point.
We have however also added support for node's module `exports` such that if your tsconfig is setup with:
```ts
"moduleResolution": "Node16",
```

imports will still work the same way they did with Reveal 3.x.
Note that this may require a bump in typescript version.
If this is not possible for you, then you need to change all imports to be `from @cognite/reveal`.

Using Reveal 3 or Reveal 4 with `"moduleResolution": "Node16"` the import path of the Axis Cross Tool is:

```ts
import { AxisViewTool } from '@cognite/reveal/tools';
const axisViewTool = new AxisViewTool(...);
```

if you use Reveal 4 without the `Node16` module resolution, the import should look like this:
```ts
import { AxisViewTool } from '@cognite/reveal';
const axisViewTool = new AxisViewTool(...);
```

## `connect-src data:` is now a required content-security-policy
See [Installation](./installation.mdx#installation-for-projects-with-content-security-policy) for updated content security policies needed for Reveal.
Note that this is only relevant if you have a content-security-policy set up.

## Three.js is now a peer-dependency
For Reveal 4 we have changed threejs from being exported from Reveal and rather require applications that consume Reveal to import it.
There are multiple reasons for this, but a major pain point has been that Reveal does not expose the three.js examples in its export, causing applications to have to install threejs anyway.
In addition, we also see a lot of applications ending up having multiple bundles of three.js which we are trying to alliviate.

## `Cognite3DViewer.setBackgroundColor` now has optional alpha parameter
The `setBackgroundColor` now supports settings alpha value.
This becomes relevant when you want your 3D content to blend with your website.

## `Cognite3DModel` has been renamed to `CogniteCadModel`
Renamed for clarity, as technically a point cloud can also be viewed as a 3D model.

## `Cognite3DViewer.getIntersectionFromPixel` options parameter has been removed
Reveal currently uses GPU driven picking for point clouds, so the previously used options are not applicable anymore.

## `DefaultCameraManager` no longer exposes its internal `ComboControls` implementation
Methods for settings and getting options has been added to support dynamically updating the state.

## `CogniteCadModel` and `PointCloudModel` no longer inherit from the three.js Object3D base class
This prevents usages that Reveal does not handle such as reparenting and other mutable operations on the three.js object.
Methods such as setting the transformation or visibility are available

## `contiuousModelStreaming` option has been promoted to opt-out
This means that CAD models will now stream continuously (vs. just when camera stops moving) by default.
This can be reverted by setting the `contiuousModelStreaming` option to false when initializing the `Cognite3DViewer`.

## Styling types use `THREE.Color` instead of RGB tuples

The `NodeAppearance` and `PointCloudAppearance` objects now use `THREE.Color` from the threejs library for storing colors. This means that e.g. a style that was previously created by writing

```
const style = { color: [0, 255, 0] };
```

must now be created by writing

```
// import * as THREE from 'three';
const style = { color: new THREE.Color(0, 1.0, 0) };
```

## `CognitePointCloudModel`'s `getClasses` method now returns more data

Previously, a call to `pointCloudModel.getClasses()` (where `pointCloudModel` is an instance of `CognitePointCloudModel`) would return the available classification codes as a list of numbers. It now returns structs of type `{ code: number, name: string }`, where `code` corresponds to the previously returned classification code, and `name` is a human-readable name of the class.

## Changes related to the `CameraManager` interface

Two major changes are now required for `CameraManager`s.
The first change is adding a `cameraStop` which Reveal will use to control when geometry should be loaded and other performance intensive computations.
The second is adding a activate / deactivate method to handle transitioning to and from other `CameraManager`s and lets each implementation decide what this functionality should look like.

`CameraManager` implementations must now allow listeners for the `'cameraStop'` event, in addition to the old `'cameraChange'` event. This is to allow `CameraManager` implementors the flexibility of deciding when the camera manager is standing still. The event *must* be emitted in order to trigger loading of model data if `continuousStreaming` is set to `false`.

In order to make this transition easy, we expose the `DebouncedCameraStopEventTrigger` class, which will fire a stop event when the camera manager's `'cameraChange'` has not triggered for a short while.

To use this class, construct it in the custom camera manager's constructor:
```
this._stopEventTrigger = new DebouncedCameraStopEventTrigger(this);
```
Note that it takes the custom camera manager itself as argument. It will immediately subscribe to the `cameraChange` event on this camera manager, so make sure any prerequisite initialization is finished before constructing it.

Then, implement a new `on(eventType, callback)` method, for instance:
```
on(eventType: CameraManagerEventType, callback: CameraEventDelegate): void {
    switch(eventType) {
        case 'cameraChange':
            // handle adding camera change callback as before
            break;
        case 'cameraStop':
            this._stopEventTrigger.subscribe(callback as CameraStopDelegate);
            break;
        default:
            throw Error(`Unrecognized camera event type: ${event}`);
    }
}
```
The `off(eventType, callback)` implementation may have a similar structure, but calling `unsubscribe` on the trigger object instead of `subscribe`.

Finally, call `this._stopEventTrigger.dispose()` in the camera manager's `dispose()` method to clean up resources after use.

## `get`/`setModelTransformation` are now relative to to the initial CDF-to-ThreeJS transform

In earlier versions of Reveal, the `model.getModelTransformation()` method (`model` being an instance of `CogniteCadModel` or `CognitePointCloudModel`) would return the entire model transformation from CDF geometry coordinates to the model's current transform in threejs-space. It will now only return the custom transformation applied *after* the initial transform from CDF space to threejs/Reveal space. Thus, it will only return what was last set by `model.setModelTransformation()`, and the identity transformation if no transformation has been set.

We now also provide `model.getCdfToDefaultModelTransformation()` that returns the matrix transformation from CDF coordinates to Reveal/threejs space. It may include an additional default transformation specified for this model in the backend.

Thus, to get the full transformation from CDF coordinates to the model's transform in Reveal space, you would use something akin to

```
const totalTransform = model.getModelTransformation().clone().multiply(model.getCdfToDefaultModelTransformation());
```
This is useful when combining visualization of a model with other 3D data extracted directly from CDF outside Reveal.

## Removed several CDF/model transformation methods

The methods `mapFromCdfToModelCoordinates`, `mapPositionFromModelToCdfCoordinates`, `mapBoxFromCdfToModelCoordinates`, `mapBoxFromModelToCdfCoordinates` have been removed from `CogniteCadModel`.

The `*FromCdfToModelCoordinates` can be emulated by constructing the transformation matrix with

```
const cdfTransformation = model.getModelTransformation().clone().multiply(model.getCdfToDefaultModelTransformation());
```
as was mentioned above. It can then be used in either `position.applyMatrix4(cdfTransformation)` or `box.applyMatrix4(cdfTransformation)` respectively.

The `*FromModelToCdfCoordinates` can likewise be emulated using the matrix
```
const inverseCdfTransformation = model.getModelTransformation().clone().multiply(model.getCdfToDefaultModelTransformation()).invert();
```
and using it with `applyMatrix4()` as above.

## Potree prefix removed

In Reveal 4, several symbols has `Potree`-prefix which now has been replaced. This includes:

- `PotreePointColorType` is now called `PointColorType`
- `PotreePointShape` is now called `PointShape`
- `PotreePointSizeType` is now called `PointSizeType`
- `PotreeClassification` is now called `PointClassification`

The above changes are simple renames and migrating these should be very easy.

## Removed methods on Cognite3DViewer
* `getScene()`
* `renderer`
* `isBrowserSupported`
* `getCamera()`, can be fetched with `cameraManager.getCamera()`

## Removed tools due to low / no usage
* Geomap tool
* Exploded view tool
