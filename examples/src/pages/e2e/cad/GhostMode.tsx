/*!
 * Copyright 2020 Cognite AS
 */

import * as reveal from '@cognite/reveal/experimental';
import React from 'react';
import { Viewer } from '../Viewer';
import * as THREE from 'three';

export function GhostModeTestPage() {
  const getNodeAppearanceProvider = (): reveal.NodeAppearanceProvider => {
    const ghostedNodes = new Set(
      [...Array(32).keys()].map((_value, index) => 2 * index)
    );
    const pickedNodes = new Set([0, 1, 2, 3, 4, 5, 6, 20, 22, 33, 34, 35]);
    return {
      styleNode(treeIndex: number) {
        let style = reveal.DefaultNodeAppearance.NoOverrides;
        if (pickedNodes.has(treeIndex)) {
          style = { ...style, ...reveal.DefaultNodeAppearance.Highlighted };
        }
        if (ghostedNodes.has(treeIndex)) {
          style = { ...style, ...reveal.DefaultNodeAppearance.Ghosted };
        }
        return style;
      },
    };
  };

  return (
    <Viewer
      nodeAppearanceProvider={getNodeAppearanceProvider()}
      modifyTestEnv={({ renderer }) => {
        renderer.setClearColor('magenta');

        return {
          camera: new THREE.PerspectiveCamera(),
          renderer,
          cameraConfig: {
            position: new THREE.Vector3(45, 3, 13),
          },
        };
      }}
    />
  );
}
