/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import * as THREE from 'three';
import { Cognite3DViewer } from '../../public/migration/Cognite3DViewer';
import { AxisViewTool } from './AxisViewTool';

describe('AxisViewTool', () => {
  let canvasContainer: HTMLElement;
  let viewer: Cognite3DViewer;

  const sdk = new CogniteClient({ appId: 'cognite.reveal.unittest' });
  const context: WebGLRenderingContext = require('gl')(64, 64, { preserveDrawingBuffer: true });
  const renderer = new THREE.WebGLRenderer({ context });

  beforeEach(() => {
    canvasContainer = document.createElement('div');
    canvasContainer.style.width = '640px';
    canvasContainer.style.height = '480px';
    viewer = new Cognite3DViewer({ domElement: canvasContainer, sdk, renderer });
  });

  test('Test creation of tool', () => {
    const xPosition = 123;
    const yPosition = 234;
    const tool = new AxisViewTool(viewer, { position: { xAbsolute: xPosition, yAbsolute: yPosition } });
    expect((tool as any)._screenPosition.x).toBe(xPosition);
    expect((tool as any)._screenPosition.y).toBe(yPosition);
  });
});
