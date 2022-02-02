//= ====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//= ====================================================================================

import * as THREE from 'three';

import { Colors } from '../../Core/Primitives/Colors';
import { ThreeConverter } from '../Utilities/ThreeConverter';

export class ThreeMiniWindow {
  public static compassSize = 0.125;

  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _scene: THREE.Scene | null = null;

  private _camera: THREE.OrthographicCamera = new THREE.OrthographicCamera(
    -1,
    1,
    1,
    -1,
    -1,
    1
  );

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get scene(): THREE.Scene {
    if (this._scene == null) {
      this._scene = new THREE.Scene();

      // Add some lights
      const ambientLight = new THREE.AmbientLight(0x404040, 0.35); // soft white light
      const directionalLight = new THREE.DirectionalLight(
        ThreeConverter.toThreeColor(Colors.white),
        0.9
      );
      directionalLight.position.set(0, 0, 1);
      this._scene.add(ambientLight);
      this._scene.add(directionalLight);
    }
    return this._scene;
  }

  // ==================================================
  // INSTANCE METHODS:
  // ==================================================

  public render(renderer: THREE.WebGLRenderer): void {
    const size = renderer.getSize(new THREE.Vector2());
    const meanSideSize = (size.x + size.y) / 2;
    const viewportSize = meanSideSize * ThreeMiniWindow.compassSize;
    renderer.setViewport(
      size.width - viewportSize,
      0,
      viewportSize,
      viewportSize
    );
    renderer.render(this.scene, this._camera);
    renderer.setViewport(0, 0, size.x, size.y);
  }
}
