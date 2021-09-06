/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import * as THREE from 'three';
import { Cognite3DViewer } from '@reveal/core';
import { createGlContext } from '@reveal/core/__testutilities__';

import { GeomapTool } from './GeomapTool';
import { MapConfig } from './MapConfig';

describe('GeomapTool', () => {
  let canvasContainer: HTMLElement;
  let viewer: Cognite3DViewer;

  const sdk = new CogniteClient({ appId: 'cognite.reveal.unittest' });
  const context = createGlContext(64, 64, { preserveDrawingBuffer: true });
  const renderer = new THREE.WebGLRenderer({ context });
  const domSize = { height: 480, width: 640 };

  beforeEach(() => {
    canvasContainer = document.createElement('div');
    canvasContainer.style.width = `${domSize.width}px`;
    canvasContainer.style.height = `${domSize.height}px`;
    viewer = new Cognite3DViewer({ domElement: canvasContainer, sdk, renderer });
  });

  test('Creation of tool', () => {
    const mapConfig: MapConfig = {
        mapProvider: "MapBoxMap",
        mapAPIKey: "pk.eyJ1IjoicHJhbW9kLXMiLCJhIjoiY2tzb2JkbXdyMGd5cjJubnBrM3IwMTd0OCJ9.jA9US2D2FRXUlldhE8bZgA",
        mapMode: 100,
        id: "mapbox/satellite-streets-v10",
        format: "jpg70",
        latlong: {
          latitude: 59.9016426931744,
          longitude: 10.607235872426175
        }
      }
    const tool = new GeomapTool(viewer, mapConfig);
  });
});
