# three-combo-controls

> Orbit &amp; first person camera controller for [three.js](https://threejs.org/)

---

## Development
```
$ yarn run start
```

## Usage
```js

import { ComboControls } from '@cognite/three-combo-controls';
import * as THREE from 'three';

const controls = new ComboControls(camera, domElement);
const clock = new THREE.Clock();

function animate() {
  controls.update(clock.getDelta());
  // ...
}
```

Mouse actions:
  - Left click & drag to rotate
  - Right click & drag to pan
  - Wheel to zoom

Touch actions:
  - One finger to rotate
  - Two fingers to pan & zoom (pinch)

Keyboard actions:
  - w & s to zoom
  - a, d, q & e to pan
  - Arrows to rotate (first person)
  
For tests:
  - c, b for only target change 
  - f to reset target position

## Usage (advance)

```js
controls.dispose();

controls.addEventListener('cameraChange', (event) => {
  const { position, target } = event.camera;
  // position & target in world space and instanceof THREE.Vector3
});

// options with default values
controls.enabled = true; // enable / disable all interactions
controls.enableDamping = true; // enable / disable smooth transitions
controls.dampingFactor = 0.2; // smooth transition factor (<= 1). Move (targetState - currentState) * dampingFactor for each `controls.update` call
controls.dynamicTarget = false; // possible to zoom past the target (will move the target if you are closer than minZoomDistance to the target)
controls.dollyFactor = 0.98; // zoom factor (when zooming one step the distance to the target will be distance = oldDistance * dollyFactor)

controls.minDistance = 1; // parameter determining speed of camera movement when zooming
controls.minZoomDistance = 1; // minimum distance to the target when zooming (see also dynamicTarget)

controls.minPolarAngle = 0; // minium polar angle around the target (radians)
controls.maxPolarAngle = Math.PI; // maximum polar angle around the target (radians)
controls.minAzimuthAngle = -Infinity; // minimum azimuth angle around the target (radians)
controls.maxAzimuthAngle = Infinity; // maximum azimuth angle around the target (radians)

controls.enableKeyboardNavigation = true; // enable / disable keyboard navigation
controls.keyboardDollySpeed = 2; // using keyboard ('W' & 'S') will zoom equal to keyboardDollySpeed mouse wheel events
controls.keyboardPanSpeed = 10; // using keyboard ('A' & 'D') to pan will be equal to keyboardPanSpeed pixels mouse pan
controls.keyboardSpeedFactor = 3; // speed factor for keyboard navigation (pan & zoom) when 'shift' key is pressed
controls.firstPersonRotationFactor = 0.4; // rotation speed in first person mode

controls.pinchPanSpeed = 1; // pinch (touch) pan speed
controls.pinchEpsilon = 2; // minimum pixels change for pinch (touch & pan) to trigger pinch action 
controls.pointerRotationSpeedPolar = Math.PI / 360; // rotation speed for touch in radians per pixel
controls.pointerRotationSpeedAzimuth = Math.PI / 360; // rotation speed for touch in radians per pixel

controls.keyboardRotationSpeedAzimuth = 10 * Math.PI / 360; // rotation speed for keyboard first person mode (arrow-keys).
controls.keyboardRotationSpeedPolar = 10 * Math.PI / 360; // rotation speed for keyboard first person mode (arrow-keys).

controls.minZoom = 0; // minimum zoom distance, only available when camera is orthographic
controls.maxZoom = Infinity; // maximum zoom distance, only available when camera is orthographic
controls.orthographicCameraDollyFactor = 0.3; // dolly factor of orthographic camera
controls.lookAtViewTarget = false; // toggles use of view target for camera 'lookAt' method. Used for zooming and playing animations at the same time.
controls.useScrollTarget = false; // enables usage of new controls mechanics that relies on scrollTarget that is set when user initiate wheel scroll.
```

