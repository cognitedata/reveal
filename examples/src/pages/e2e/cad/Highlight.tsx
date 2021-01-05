/*!
 * Copyright 2020 Cognite AS
 */

import React from 'react';

import { Viewer } from '../Viewer';
import * as THREE from 'three';

import * as reveal from '@cognite/reveal/experimental';

export function HighlightTestPage() {
  const getNodeAppearanceProvider = () => {
    const pickedNodes = new Set([...Array(15).keys()]);
    return {
      styleNode(treeIndex: number) {
        let style = reveal.DefaultNodeAppearance.NoOverrides;
        if (pickedNodes.has(treeIndex)) {
          style = { ...style, ...reveal.DefaultNodeAppearance.Highlighted };
        }
        return style;
      },
    };
  };

  return (
    <Viewer
      nodeAppearanceProvider={getNodeAppearanceProvider()}
      modifyTestEnv={() => {
        return {
          camera: new THREE.PerspectiveCamera(),
          cameraConfig: {
            position: new THREE.Vector3(12, -4, -45),
          },
        };
      }}
    />
  );
}
