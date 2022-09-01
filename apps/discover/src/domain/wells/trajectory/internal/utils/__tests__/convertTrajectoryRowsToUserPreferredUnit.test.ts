import { UserPreferredUnit } from 'constants/units';

import { trajectoryDataRow } from '../../__fixtures/trajectoryDataRow';
import {
  convertTrajectoryRowsToUserPreferredUnit,
  DepthUnitsType,
} from '../convertTrajectoryRowsToUserPreferredUnit';

describe('convertTrajectoryRowsToUserPreferredUnit', () => {
  const rowData = trajectoryDataRow();
  const depthUnits: DepthUnitsType = {
    trueVerticalDepthUnit: 'foot',
    measuredDepthUnit: 'foot',
    equivalentDepartureUnit: 'foot',
    offsetUnit: 'foot',
  };

  it('should return same row data', () => {
    const result = convertTrajectoryRowsToUserPreferredUnit(
      rowData,
      UserPreferredUnit.FEET,
      depthUnits
    );

    expect(result).toMatchObject(rowData);
  });

  it('should return expected output', () => {
    const result = convertTrajectoryRowsToUserPreferredUnit(
      rowData,
      UserPreferredUnit.FEET,
      { ...depthUnits, trueVerticalDepthUnit: 'meter' }
    );

    expect(result[0]).toMatchObject({
      ...rowData[0],
      trueVerticalDepth: 856.923,
    });
  });

  it('should return converted meter result', () => {
    const result = convertTrajectoryRowsToUserPreferredUnit(
      rowData,
      UserPreferredUnit.METER,
      depthUnits
    );

    expect(result[0]).toMatchObject({
      ...rowData[0],
      trueVerticalDepth: 79.611,
      measuredDepth: 79.629,
      northOffset: 1.366,
      eastOffset: 0.005,
      equivalentDeparture: 1.366,
    });
  });

  it('should return converted feet result', () => {
    const result = convertTrajectoryRowsToUserPreferredUnit(
      rowData,
      UserPreferredUnit.FEET,
      {
        trueVerticalDepthUnit: 'meter',
        measuredDepthUnit: 'meter',
        equivalentDepartureUnit: 'meter',
        offsetUnit: 'meter',
      }
    );

    expect(result[0]).toMatchObject({
      ...rowData[0],
      trueVerticalDepth: 856.923,
      measuredDepth: 857.119,
      northOffset: 14.698,
      eastOffset: 0.052,
      equivalentDeparture: 14.698,
    });
  });
});
