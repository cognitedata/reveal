/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import React from 'react';
import { BoundingBoxClipper } from '@cognite/reveal';
import { TestEnvCad, TestViewer } from '../TestViewer';

export function ClippingTestPage() {
  return (
    <TestViewer
      modifyTestEnv={({ revealManager }: TestEnvCad) => {
        const params = {
          clipIntersection: true,
          width: 10,
          height: 10,
          depth: 10,
          x: 0,
          y: 0,
          z: 0,
          showHelpers: false,
        };

        const boxClipper = new BoundingBoxClipper(
          new THREE.Box3(
            new THREE.Vector3(
              params.x - params.width / 2,
              params.y - params.height / 2,
              params.z - params.depth / 1.5
            ),
            new THREE.Vector3(
              params.x + params.width / 1.5,
              params.y + params.height / 2,
              params.z + params.depth / 2
            )
          ),
          params.clipIntersection
        );

        revealManager.clippingPlanes = boxClipper.clippingPlanes;
        revealManager.clipIntersection = boxClipper.intersection;

        return {
          camera: new THREE.PerspectiveCamera(),
        };
      }}
    />
  );
}
