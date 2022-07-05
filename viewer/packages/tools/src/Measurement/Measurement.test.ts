/*!
 * Copyright 2022 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import { Cognite3DViewer, Intersection } from '@reveal/api';
import { MeasurementOptions } from 'dist/tools';
import * as THREE from 'three';
import { createGlContext, mockClientAuthentication, createCadModel } from '../../../../test-utilities';
import { HtmlOverlayTool } from '../HtmlOverlay/HtmlOverlayTool';
import { Measurement } from './Measurement';

describe(Measurement.name, () => {
  let measurement: Measurement;
  let overlay: HtmlOverlayTool;
  let meshGroup: THREE.Group;
  const intersection: Intersection = {
    type: 'cad',
    model: createCadModel(1, 2, 3, 3),
    treeIndex: 0,
    point: new THREE.Vector3(100, 100, 100),
    distanceToCamera: 10
  };

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

    const domSize = { height: 480, width: 640 };
    const canvasContainer = document.createElement('div');
    canvasContainer.style.width = `${domSize.width}px`;
    canvasContainer.style.height = `${domSize.height}px`;
    const viewer = new Cognite3DViewer({ domElement: canvasContainer, sdk, renderer });

    const options: Required<MeasurementOptions> = {
      distanceToLabelCallback: (distanceInMeters: number) => `${(distanceInMeters * 10).toFixed(2)} dm`,
      color: 0x00ff00,
      lineWidth: 2
    };
    overlay = new HtmlOverlayTool(viewer);
    const htmlElement = document.createElement('div');
    htmlElement.style.position = 'absolute';
    const position = new THREE.Vector3();
    overlay.add(htmlElement, position);

    meshGroup = new THREE.Group();
    measurement = new Measurement(canvasContainer, viewer.getCamera(), meshGroup, options, overlay);
  });

  test('startMeasurement() adds mesh to group', () => {
    const addSpy = jest.spyOn(meshGroup, 'add');
    measurement.startMeasurement(new THREE.Vector3(0, 1, 2));
    expect(addSpy).toBeCalledTimes(1);
  });

  test('update() fails if called before startMeasurement()', () => {
    const event = new MouseEvent('mousemove', { screenX: 1, screenY: 1 });
    expect(() => measurement.update(event)).toThrowError();
  });

  test('removeMeasurement() removes mesh group group', () => {
    const removeObject3DSpyOn = jest.spyOn(meshGroup, 'remove');
    measurement.startMeasurement(new THREE.Vector3(1, 1, 1));
    measurement.removeMeasurement();

    expect(removeObject3DSpyOn).toHaveBeenCalledTimes(1);
  });
});
