/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import * as reveal from '@cognite/reveal/experimental';
import React from 'react';
import { TestViewer } from '../TestViewer';

export function NodeTransformTestPage() {
  const getNodeAppearanceProvider = () => {
    const transformedNodes: Map<number, THREE.Matrix4> = new Map();
    const transformedTreeIndexes = [...Array(80).keys()].filter(
      (p) => p % 2 === 0
    );
    transformedTreeIndexes.forEach((p) => {
      const transform = new THREE.Matrix4();
      transform.makeRotationFromEuler(
        new THREE.Euler(Math.PI / 2, Math.PI / 2, -Math.PI)
      );
      transform.setPosition(new THREE.Vector3(5, 6, 7));
      transformedNodes.set(p, transform);
    });
    return {
      styleNode(treeIndex: number) {
        if (transformedNodes.has(treeIndex)) {
          return { worldTransform: transformedNodes.get(treeIndex)! };
        }
        return reveal.DefaultNodeAppearance.NoOverrides;
      },
    };
  };
  return <TestViewer nodeAppearanceProvider={getNodeAppearanceProvider()} />;
}
