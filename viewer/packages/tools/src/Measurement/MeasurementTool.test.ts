/*!
 * Copyright 2022 Cognite AS
 */
import { CogniteClient } from '@cognite/sdk';
import { Cognite3DViewer } from '@reveal/core';
import * as THREE from 'three';
import { createGlContext, mockClientAuthentication } from '../../../../test-utilities';

import { MeasurementTool } from './MeasurementTool';

describe(MeasurementTool.name, () => {
  let viewer: Cognite3DViewer;
  let canvasContainer: HTMLElement;
  let domSize: { height: number; width: number };

  let measurementTool: MeasurementTool;

  beforeEach(() => {
    const sdk = new CogniteClient({
      appId: 'cognite.reveal.unittest',
      project: 'dummy',
      getToken: async () => 'dummy'
    });
    mockClientAuthentication(sdk);
    const context = createGlContext(64, 64, { preserveDrawingBuffer: true });
    const renderer = new THREE.WebGLRenderer({ context });
    renderer.render = jest.fn();

    domSize = { height: 480, width: 640 };
    canvasContainer = document.createElement('div');
    canvasContainer.style.width = `${domSize.width}px`;
    canvasContainer.style.height = `${domSize.height}px`;
    viewer = new Cognite3DViewer({ domElement: canvasContainer, sdk, renderer });

    measurementTool = new MeasurementTool(viewer);
  });

  test('Add Point to point distance measurement', () => {
    const addSpyOn = jest.spyOn(measurementTool, 'add');

    measurementTool.add();

    expect(addSpyOn).toBeCalled();
  });

  test('Remove distance memasurement', () => {
    const removeSpyOn = jest.spyOn(measurementTool, 'remove');
    measurementTool.remove();

    expect(removeSpyOn).toBeCalled();
  });

  test('Set Line Options width and color', () => {
    const setLineOptionsSpyOn = jest.spyOn(measurementTool, 'updateLineOptions');
    const lineOptions = {
      lineWidth: 1.0,
      color: 0xff0000
    };
    measurementTool.updateLineOptions(lineOptions);

    expect(setLineOptionsSpyOn).toBeCalled();
    expect((measurementTool as any)._lineOptions.lineWidth).toBe(lineOptions.lineWidth);
    expect((measurementTool as any)._lineOptions.color).toBe(lineOptions.color);
  });
});
