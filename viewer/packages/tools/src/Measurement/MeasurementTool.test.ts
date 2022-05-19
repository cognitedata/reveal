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

  test('update measure line color', () => {
    const lineColorUpdateSpyOn = jest.spyOn(measurementTool, 'updateLineColor');
    measurementTool.updateLineColor(0xff0000);

    expect(lineColorUpdateSpyOn).toBeCalled();
    expect((measurementTool as any)._lineOptions.color).toBe(0xff0000);
  });

  test('update measure line width', () => {
    const lineWidthUpdateSpyOn = jest.spyOn(measurementTool, 'updateLineWidth');
    measurementTool.updateLineColor(1.0);

    expect(lineWidthUpdateSpyOn).toBeCalled();
    expect((measurementTool as any)._lineOptions.lineWidth).toBe(1.0);
  });

  test('Calculate midpoint', () => {
    const firstPoint = new THREE.Vector3(100, 100, 100);
    const secondPoint = new THREE.Vector3(200, 200, 200);
    const calculateMidpointSpyOn = jest.spyOn(MeasurementTool.prototype as any, 'calculateMidpoint');
    const calculateMidpointImplementation = calculateMidpointSpyOn.getMockImplementation();

    expect(calculateMidpointImplementation(firstPoint, secondPoint)).toEqual(new THREE.Vector3(150, 150, 150));
  });
});
