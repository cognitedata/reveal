/*!
 * Copyright 2022 Cognite AS
 */
import { CogniteClient } from '@cognite/sdk';
import { Cognite3DViewer } from '@reveal/core';
import * as THREE from 'three';
import { createGlContext, mockClientAuthentication } from '../../../../../test-utilities';
import { MeasurementControls } from '../MeasurementControls';

describe(MeasurementControls.name, () => {
  let viewer: Cognite3DViewer;
  let canvasContainer: HTMLElement;
  let domSize: { height: number; width: number };

  let measurementControls: MeasurementControls;

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

    measurementControls = new MeasurementControls(viewer);
  });

  test('Add a distance measurement type to the controls', () => {
    const addSpyOn = jest.spyOn(measurementControls, 'add');
    measurementControls.add();

    expect(addSpyOn).toBeCalled();
  });

  test('Remove distance measurement', () => {
    const removeSpyOn = jest.spyOn(measurementControls, 'remove');
    measurementControls.remove();

    expect(removeSpyOn).toBeCalledTimes(1);
  });

  test('Check multiple removal of measurement type', () => {
    const removeSpyOn = jest.spyOn(measurementControls, 'remove');
    measurementControls.add();

    expect((measurementControls as any)._measurementDistance).toBeDefined();
    measurementControls.remove();

    expect((measurementControls as any)._measurementDistance).toBeNull();
    measurementControls.remove();

    expect(removeSpyOn).toBeCalledTimes(2);
  });

  test('Update Line width & color', () => {
    const updateLineOptionsSpyOn = jest.spyOn(measurementControls, 'updateLineOptions');
    const lineOptions = {
      color: 0xff0000,
      lineWidth: 1.0
    };

    measurementControls.add();
    measurementControls.updateLineOptions(lineOptions);

    expect(updateLineOptionsSpyOn).toBeCalled();
    expect((measurementControls as any)._lineOptions.color).toStrictEqual(lineOptions.color);
    expect((measurementControls as any)._lineOptions.lineWidth).toBe(lineOptions.lineWidth);
  });
});
