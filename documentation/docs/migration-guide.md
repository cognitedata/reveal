---
id: migration-guide
title: Migrating from previous versions
hide_title: true
description: This page describes the differences between Reveal 3 and 4.
---

import { DemoWrapper } from '@site/docs/components/DemoWrapper';

This document is an overview of some important differences between Reveal 3.x and Reveal 4.x.

## Potree prefix removed

In Reveal 3, several symbols has `Potree`-prefix which now has been replaced. This includes:

- `PotreePointColorType` is now called `PointColorType`
- `PotreePointShape` is now called `PointShape`
- `PotreePointSizeType` is now called `PointSizeType`
- `PotreeClassification` is now called `PointClassification`

The above changes are simple renames and migrating these should be very easy.

## Styling types use THREE.Color instead of RGB tuples

The `NodeAppearance` and `PointCloudAppearance` objects now use `THREE.Color` from the threejs library for storing colors. This means that e.g. a style that was previously created by writing

```
const style = { color: [0, 255, 0] };
```

must now be created by writing

```
// import * as THREE from 'three';
const style = { color: new THREE.Color(0, 1.0, 0) };
```

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

## 'cameraStop' event on CameraManager

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
