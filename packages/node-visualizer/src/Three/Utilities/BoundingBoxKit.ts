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
import { Group } from 'three';

import { Range3 } from '../../Core/Geometry/Range3';
import { Colors } from '../../Core/Primitives/Colors';
import { ThreeConverter } from '../Utilities/ThreeConverter';
import { ThreeTransformer } from '../Utilities/ThreeTransformer';

export class BoundingBoxKit {
  static getBoundingBox(
    object: THREE.Object3D | null,
    transformer: ThreeTransformer
  ): Range3 | undefined {
    if (!object) return undefined;

    if (object instanceof Group) {
      const boundingBox = new Range3();
      for (const child of object.children) {
        const childBoundingBox = BoundingBoxKit.getBoundingBox(
          child,
          transformer
        );
        if (childBoundingBox) {
          boundingBox.addRange(childBoundingBox);
        }
      }
      return boundingBox;
    }
    const helper = new THREE.BoxHelper(
      object,
      ThreeConverter.toThreeColor(Colors.white)
    );
    helper.geometry.computeBoundingBox();
    return transformer.rangeToWorld(helper.geometry.boundingBox, false);
  }
}
