/*!
 * Copyright 2022 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import { Cognite3DViewer, Intersection } from '@reveal/api';
import * as THREE from 'three';
import { createGlContext, mockClientAuthentication, createCadModel } from '../../../../test-utilities';
import { HtmlOverlayTool } from '../HtmlOverlay/HtmlOverlayTool';
import { Measurement } from './Measurement';

describe(Measurement.name, () => {
  let viewer: Cognite3DViewer;
  let canvasContainer: HTMLElement;
  let domSize: { height: number; width: number };
  let measurement: Measurement;
  let overlay: HtmlOverlayTool;
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

    domSize = { height: 480, width: 640 };
    canvasContainer = document.createElement('div');
    canvasContainer.style.width = `${domSize.width}px`;
    canvasContainer.style.height = `${domSize.height}px`;
    viewer = new Cognite3DViewer({ domElement: canvasContainer, sdk, renderer });

    const options = {
      changeMeasurementLabelMetrics: (distance: number) => {
        return { distance: distance * 2.0, units: 'ft' };
      }
    };
    overlay = new HtmlOverlayTool(viewer);
    const htmlElement = document.createElement('div');
    htmlElement.style.position = 'absolute';
    const position = new THREE.Vector3();
    overlay.add(htmlElement, position);

    measurement = new Measurement(viewer, options, overlay);
  });

  test('Start measurement line mesh', () => {
    const addObject3DSpyOn = jest.spyOn(viewer, 'addObject3D');

    expect(measurement.getMesh()).toBeNull();
    measurement.startMeasurement(intersection);

    expect(measurement.getMesh()).not.toBeNull();
    expect(addObject3DSpyOn).toBeCalledTimes(1);
  });

  test('Update the measurement line mesh', () => {
    const event = new MouseEvent('mousemove', { screenX: 1, screenY: 1 });
    measurement.startMeasurement(intersection);

    let meshGroup = measurement.getMesh();
    let mesh = meshGroup?.children[0] as THREE.Mesh;

    let points = mesh.geometry.getAttribute('instanceEnd').array;
    let endPoint = new THREE.Vector3(points![3], points![4], points![5]);

    expect(endPoint).toEqual(intersection.point);

    measurement.update(event);

    meshGroup = measurement.getMesh();
    mesh = meshGroup?.children[0] as THREE.Mesh;

    points = mesh.geometry.getAttribute('instanceEnd').array;;
    endPoint = new THREE.Vector3(points![3], points![4], points![5]);

    expect(endPoint).not.toEqual(intersection.point);
  });

  test('Remove the measurement objects line mesh & sphere meshes', () => {
    const removeObject3DSpyOn = jest.spyOn(viewer, 'removeObject3D');
    measurement.startMeasurement(intersection);

    expect(measurement.getMesh()).not.toBeNull();

    measurement.removeMeasurement();

    expect(removeObject3DSpyOn).toBeCalledTimes(1);
  });

  test('Set measurement line width & color', () => {
    const lineOptions = {
      lineWidth: 1.0,
      color: 0xff0000
    };

    measurement.setLineOptions(lineOptions);

    expect((measurement as any)._line._options.lineWidth).toEqual(1.0);
    expect((measurement as any)._line._options.color).toEqual(0xff0000);
  });

  test('Get measurement line mesh', () => {
    expect(measurement.getMesh()).toBeNull();

    measurement.startMeasurement(intersection);

    expect(measurement.getMesh()).toEqual((measurement as any)._lineMesh);
  });
});
