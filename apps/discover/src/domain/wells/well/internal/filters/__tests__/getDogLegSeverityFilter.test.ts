import { UserPreferredUnit } from 'constants/units';

import { getDogLegSeverityFilter } from '../getDogLegSeverityFilter';

const testTuple = [10, 20];

describe('getDogLegSeverityFilter', () => {
  it('should return empty object with empty input', () => {
    expect(getDogLegSeverityFilter('')).toEqual({});
  });

  it('should return empty object with invalid input', () => {
    expect(getDogLegSeverityFilter([10, 20])).toEqual({});
  });

  it('should return expected output with valid input (feet)', () => {
    const resultWithFeet = getDogLegSeverityFilter(
      testTuple,
      UserPreferredUnit.FEET
    );

    expect(resultWithFeet).toEqual({
      trajectories: {
        maxDoglegSeverity: {
          min: testTuple[0],
          max: testTuple[1],
          unit: {
            angleUnit: 'degree',
            distanceInterval: undefined,
            distanceUnit: 'foot',
          },
        },
      },
    });
  });

  it('should return expected output with valid input (meter)', () => {
    const resultWithMeter = getDogLegSeverityFilter(
      testTuple,
      UserPreferredUnit.METER
    );

    expect(resultWithMeter).toEqual({
      trajectories: {
        maxDoglegSeverity: {
          min: testTuple[0],
          max: testTuple[1],
          unit: {
            angleUnit: 'degree',
            distanceInterval: undefined,
            distanceUnit: 'meter',
          },
        },
      },
    });
  });

  it('should return expected outputs with valid input (feet)', () => {
    const resultWithFeet = getDogLegSeverityFilter(
      testTuple,
      UserPreferredUnit.FEET,
      { feetDistanceInterval: 45, meterDistanceInterval: 50 }
    );

    expect(resultWithFeet).toEqual({
      trajectories: {
        maxDoglegSeverity: {
          min: testTuple[0],
          max: testTuple[1],
          unit: {
            angleUnit: 'degree',
            distanceInterval: 45,
            distanceUnit: 'foot',
          },
        },
      },
    });
  });

  it('should return expected outputs with valid input (meter)', () => {
    const resultWithFeet = getDogLegSeverityFilter(
      testTuple,
      UserPreferredUnit.FEET,
      { feetDistanceInterval: 45, meterDistanceInterval: 50 }
    );

    expect(resultWithFeet).toEqual({
      trajectories: {
        maxDoglegSeverity: {
          min: testTuple[0],
          max: testTuple[1],
          unit: {
            angleUnit: 'degree',
            distanceInterval: 45,
            distanceUnit: 'foot',
          },
        },
      },
    });
  });
});
