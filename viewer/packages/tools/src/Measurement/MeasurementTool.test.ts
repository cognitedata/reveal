/*!
 * Copyright 2022 Cognite AS
 */
import { CogniteClient } from '@cognite/sdk';
import { Cognite3DViewer } from '@reveal/api';
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

  test('Initiate Cognite3DViewer ON click for measurement', () => {
    const onSetEventHandlingSpyOn = jest.spyOn(viewer, 'on');
    measurementTool.enterMeasurementMode();

    expect(onSetEventHandlingSpyOn).toHaveBeenCalled();
  });

  test('Remove Cognite3DViewer click for measurement', () => {
    const onRemoveEventHandlingSpyOn = jest.spyOn(viewer, 'off');
    measurementTool.exitMeasurementMode();

    expect(onRemoveEventHandlingSpyOn).toHaveBeenCalled();
  });

  test('Set measurement line width and color option values', () => {
    const lineOptions = { lineWidth: 1.0, color: 0xff0000 };
    measurementTool.setLineOptions(lineOptions);

    expect((measurementTool as any)._options.color).toBe(0xff0000);
    expect((measurementTool as any)._options.lineWidth).toBe(1.0);
  });
});
