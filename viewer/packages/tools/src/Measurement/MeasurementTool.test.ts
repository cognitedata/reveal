/*!
 * Copyright 2023 Cognite AS
 */

import { MeasurementTool } from './MeasurementTool';

import { Cognite3DViewer } from '@reveal/api';

import { Vector3 } from 'three';

import { mockViewer } from '../../../../test-utilities';
import { DataSourceType } from '@reveal/data-providers';

describe(MeasurementTool.name, () => {
  let viewer: Cognite3DViewer<DataSourceType>;

  beforeEach(() => {
    viewer = mockViewer();
  });

  test('addMeasurement adds measurement', () => {
    const tool = new MeasurementTool(viewer);

    const p0 = new Vector3(0, 0, 0);
    const p1 = new Vector3(1, 1, 1);

    tool.addMeasurement(p0, p1);

    const measurements = tool.getAllMeasurements();

    expect(measurements).toHaveLength(1);
    expect(measurements[0].startPoint).toEqual(p0);
    expect(measurements[0].endPoint).toEqual(p1);
  });
});
