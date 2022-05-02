/*!
 * Copyright 2022 Cognite AS
 */
import { CogniteClient } from '@cognite/sdk';
import { Cognite3DViewer } from '@reveal/core';
import * as THREE from 'three';
import { createGlContext, mockClientAuthentication } from '../../../../../test-utilities';
import { MeasurementDistance } from '../MeasurementDistance';

describe(MeasurementDistance.name, () => {
  let viewer: Cognite3DViewer;
  let canvasContainer: HTMLElement;
  let domSize: { height: number; width: number };

  let measurementDistance: MeasurementDistance;

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

    measurementDistance = new MeasurementDistance(viewer);
  });

  test('Add Start point', () => {
    const xPosition = 100;
    const yPosition = 101;
    const zPosition = 102;
    const addSpyOn = jest.spyOn(measurementDistance, 'add');
    measurementDistance.add(new THREE.Vector3(xPosition, yPosition, zPosition));

    expect(addSpyOn).toBeCalled();

    expect((measurementDistance as any)._positions[0]).toBe(xPosition);
    expect((measurementDistance as any)._positions[1]).toBe(yPosition);
    expect((measurementDistance as any)._positions[2]).toBe(zPosition);

    expect((measurementDistance as any)._measurementLine).toBeDefined();

    expect(measurementDistance.isActive()).toBeTrue();
  });

  test('Add End point', () => {
    const xPosition = 200;
    const yPosition = 201;
    const zPosition = 202;
    const updateSpyOn = jest.spyOn(measurementDistance, 'update');
    measurementDistance.add(new THREE.Vector3(0, 0, 0));
    measurementDistance.update(new THREE.Vector3(xPosition, yPosition, zPosition));

    expect(updateSpyOn).toBeCalled();

    expect((measurementDistance as any)._positions[3]).toBe(xPosition);
    expect((measurementDistance as any)._positions[4]).toBe(yPosition);
    expect((measurementDistance as any)._positions[5]).toBe(zPosition);
  });

  test('Complete the line', () => {
    const completeSpyOn = jest.spyOn(measurementDistance, 'complete');

    expect(measurementDistance.isActive()).toBeFalse();
    measurementDistance.complete();

    expect(completeSpyOn).toBeCalled();

    expect(measurementDistance.isActive()).toBeFalse();
  });

  test('Distance between two points', () => {
    const startPosition = new THREE.Vector3(0, 0, 0);
    const endPosition = new THREE.Vector3(100, 100, 1);
    const distanceSpyOn = jest.spyOn(measurementDistance, 'getMeasurementValue');

    measurementDistance.add(startPosition);
    measurementDistance.update(endPosition);

    const distance = measurementDistance.getMeasurementValue();

    expect(distanceSpyOn).toBeCalled();

    expect(distanceSpyOn).toReturnWith(distance);
  });

  test('Set line options', () => {
    const options = {
      lineWidth: 0.1,
      color: new THREE.Color(0xffffff)
    };
    const setLineOptionsSpyOn = jest.spyOn(measurementDistance, 'setLineOptions');
    measurementDistance.setLineOptions(options);

    expect(setLineOptionsSpyOn).toBeCalled();
    expect((measurementDistance as any)._lineOptions.lineWidth).toBe(0.1);
    expect((measurementDistance as any)._lineOptions.color).toStrictEqual(new THREE.Color(0xffffff));
  });
});
