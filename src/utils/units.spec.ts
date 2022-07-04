import { DatapointAggregate, DoubleDatapoint } from '@cognite/sdk';
import { ChartThreshold } from 'models/charts/charts/types/types';
import {
  convertThresholdUnits,
  convertUnits,
  getUnitConvertedDatapointsSummary,
} from './units';
import { convertValue } from '../models/charts/units/utils/convertValue';

describe('convertUnits', () => {
  it('should convert units successfully (double data points)', () => {
    const datapoints: DoubleDatapoint[] = [
      {
        timestamp: new Date('2021-02-02T12:19:28.330Z'),
        value: 1,
      },
      {
        timestamp: new Date('2021-02-02T12:20:28.330Z'),
        value: 2,
      },
      {
        timestamp: new Date('2021-02-02T12:21:28.330Z'),
        value: 3,
      },
    ];
    const inputUnit = 'psi';
    const outputUnit = 'bar';

    const output = convertUnits(datapoints, inputUnit, outputUnit);

    expect(output).toEqual([
      {
        timestamp: new Date('2021-02-02T12:19:28.330Z'),
        value: 0.0689475729,
      },
      {
        timestamp: new Date('2021-02-02T12:20:28.330Z'),
        value: 0.1378951458,
      },
      {
        timestamp: new Date('2021-02-02T12:21:28.330Z'),
        value: 0.2068427187,
      },
    ]);
  });

  it('should convert units successfully (aggregate data points)', () => {
    const datapoints: DatapointAggregate[] = [
      {
        timestamp: new Date('2021-02-02T12:19:28.330Z'),
        average: 1,
      },
      {
        timestamp: new Date('2021-02-02T12:20:28.330Z'),
        average: 2,
      },
      {
        timestamp: new Date('2021-02-02T12:21:28.330Z'),
        average: 3,
      },
    ];
    const inputUnit = 'pa';
    const outputUnit = 'bar';

    const output = convertUnits(datapoints, inputUnit, outputUnit);

    expect(output).toEqual([
      {
        timestamp: new Date('2021-02-02T12:19:28.330Z'),
        average: 0.00001,
      },
      {
        timestamp: new Date('2021-02-02T12:20:28.330Z'),
        average: 0.00002,
      },
      {
        timestamp: new Date('2021-02-02T12:21:28.330Z'),
        average: 0.00003,
      },
    ]);
  });

  it('should convert units successfully (min, max)', () => {
    const datapoints: DatapointAggregate[] = [
      {
        timestamp: new Date('2021-02-02T12:19:28.330Z'),
        min: 1,
        max: 1,
      },
      {
        timestamp: new Date('2021-02-02T12:20:28.330Z'),
        min: 2,
        max: 2,
      },
      {
        timestamp: new Date('2021-02-02T12:21:28.330Z'),
        min: 3,
        max: 3,
      },
    ];
    const inputUnit = 'pa';
    const outputUnit = 'bar';

    const output = convertUnits(datapoints, inputUnit, outputUnit);

    expect(output).toEqual([
      {
        timestamp: new Date('2021-02-02T12:19:28.330Z'),
        min: 0.00001,
        max: 0.00001,
      },
      {
        timestamp: new Date('2021-02-02T12:20:28.330Z'),
        min: 0.00002,
        max: 0.00002,
      },
      {
        timestamp: new Date('2021-02-02T12:21:28.330Z'),
        min: 0.00003,
        max: 0.00003,
      },
    ]);
  });

  it('check all conversions', () => {
    // Helper wrapper to limit decimals
    const convertValueWith2Decimals = (
      value: number,
      inputUnit: string = '',
      outputUnit: string = ''
    ) => Number(convertValue(value, inputUnit, outputUnit).toFixed(2));

    // Pressures

    // PSI to ...
    expect(convertValueWith2Decimals(10, 'psi', 'psi')).toEqual(10.0);
    expect(convertValueWith2Decimals(10, 'psi', 'bar')).toEqual(0.69);
    expect(convertValueWith2Decimals(10, 'psi', 'pa')).toEqual(68947.6);
    expect(convertValueWith2Decimals(10, 'psi', 'mpa')).toEqual(0.07);
    expect(convertValueWith2Decimals(10, 'psi', 'atm')).toEqual(0.68);

    // bar to ...
    expect(convertValueWith2Decimals(10, 'bar', 'psi')).toEqual(145.04);
    expect(convertValueWith2Decimals(10, 'bar', 'bar')).toEqual(10.0);
    expect(convertValueWith2Decimals(1, 'bar', 'pa')).toEqual(100000.0);
    expect(convertValueWith2Decimals(10, 'bar', 'mpa')).toEqual(1.0);
    expect(convertValueWith2Decimals(1, 'bar', 'atm')).toEqual(0.99);

    // atm to ...
    expect(convertValueWith2Decimals(10, 'atm', 'psi')).toEqual(146.96);
    expect(convertValueWith2Decimals(10, 'atm', 'bar')).toEqual(10.13);
    expect(convertValueWith2Decimals(10, 'atm', 'pa')).toEqual(1013250.0);
    expect(convertValueWith2Decimals(10, 'atm', 'mpa')).toEqual(1.01);
    expect(convertValueWith2Decimals(10, 'atm', 'atm')).toEqual(10.0);

    // Pa to ...
    expect(convertValueWith2Decimals(100000, 'pa', 'psi')).toEqual(14.5);
    expect(convertValueWith2Decimals(100000, 'pa', 'bar')).toEqual(1.0);
    expect(convertValueWith2Decimals(10, 'pa', 'pa')).toEqual(10.0);
    expect(convertValueWith2Decimals(100000, 'pa', 'mpa')).toEqual(0.1);
    expect(convertValueWith2Decimals(100000, 'pa', 'atm')).toEqual(0.99);

    // MPa to ...
    expect(convertValueWith2Decimals(1, 'mpa', 'psi')).toEqual(145.04);
    expect(convertValueWith2Decimals(1, 'mpa', 'bar')).toEqual(10.0);
    expect(convertValueWith2Decimals(1, 'mpa', 'pa')).toEqual(1000000.0);
    expect(convertValueWith2Decimals(10, 'mpa', 'mpa')).toEqual(10.0);
    expect(convertValueWith2Decimals(1, 'mpa', 'atm')).toEqual(9.87);

    // Lengths

    // m to ...
    expect(convertValueWith2Decimals(1, 'm', 'm')).toEqual(1.0);
    expect(convertValueWith2Decimals(1, 'm', 'cm')).toEqual(100.0);
    expect(convertValueWith2Decimals(1, 'm', 'mm')).toEqual(1000.0);
    expect(convertValueWith2Decimals(100, 'm', 'yd')).toEqual(109.36);
    expect(convertValueWith2Decimals(1, 'm', 'ft')).toEqual(3.28);
    expect(convertValueWith2Decimals(1, 'm', 'in')).toEqual(39.37);
    expect(convertValueWith2Decimals(1000, 'm', 'km')).toEqual(1.0);
    expect(convertValueWith2Decimals(100000, 'm', 'mi')).toEqual(62.14);

    // cm to ...
    expect(convertValueWith2Decimals(100, 'cm', 'm')).toEqual(1.0);
    expect(convertValueWith2Decimals(1, 'cm', 'cm')).toEqual(1.0);
    expect(convertValueWith2Decimals(1, 'cm', 'mm')).toEqual(10.0);
    expect(convertValueWith2Decimals(100, 'cm', 'yd')).toEqual(1.09);
    expect(convertValueWith2Decimals(100, 'cm', 'ft')).toEqual(3.28);
    expect(convertValueWith2Decimals(10, 'cm', 'in')).toEqual(3.94);
    expect(convertValueWith2Decimals(100000, 'cm', 'km')).toEqual(1.0);
    expect(convertValueWith2Decimals(100000, 'cm', 'mi')).toEqual(0.62);

    // mm to ...
    expect(convertValueWith2Decimals(1000, 'mm', 'm')).toEqual(1.0);
    expect(convertValueWith2Decimals(10, 'mm', 'cm')).toEqual(1.0);
    expect(convertValueWith2Decimals(1, 'mm', 'mm')).toEqual(1.0);
    expect(convertValueWith2Decimals(1000, 'mm', 'yd')).toEqual(1.09);
    expect(convertValueWith2Decimals(10, 'mm', 'ft')).toEqual(0.03);
    expect(convertValueWith2Decimals(1000, 'mm', 'in')).toEqual(39.37);
    expect(convertValueWith2Decimals(1000000, 'mm', 'km')).toEqual(1.0);
    expect(convertValueWith2Decimals(1000000, 'mm', 'mi')).toEqual(0.62);

    // yd to ...
    expect(convertValueWith2Decimals(1, 'yd', 'm')).toEqual(0.91);
    expect(convertValueWith2Decimals(1, 'yd', 'cm')).toEqual(91.44);
    expect(convertValueWith2Decimals(1, 'yd', 'mm')).toEqual(914.4);
    expect(convertValueWith2Decimals(10, 'yd', 'yd')).toEqual(10.0);
    expect(convertValueWith2Decimals(10, 'yd', 'ft')).toEqual(30.0);
    expect(convertValueWith2Decimals(1, 'yd', 'in')).toEqual(36.0);
    expect(convertValueWith2Decimals(1000, 'yd', 'km')).toEqual(0.91);
    expect(convertValueWith2Decimals(1000, 'yd', 'mi')).toEqual(0.57);

    // ft to ...
    expect(convertValueWith2Decimals(10, 'ft', 'm')).toEqual(3.05);
    expect(convertValueWith2Decimals(10, 'ft', 'cm')).toEqual(304.8);
    expect(convertValueWith2Decimals(10, 'ft', 'mm')).toEqual(3048.0);
    expect(convertValueWith2Decimals(10, 'ft', 'yd')).toEqual(3.33);
    expect(convertValueWith2Decimals(10, 'ft', 'ft')).toEqual(10.0);
    expect(convertValueWith2Decimals(10, 'ft', 'in')).toEqual(120.0);
    expect(convertValueWith2Decimals(10000, 'ft', 'km')).toEqual(3.05);
    expect(convertValueWith2Decimals(10000, 'ft', 'mi')).toEqual(1.89);

    // in to ...
    expect(convertValueWith2Decimals(100, 'in', 'm')).toEqual(2.54);
    expect(convertValueWith2Decimals(100, 'in', 'cm')).toEqual(254.0);
    expect(convertValueWith2Decimals(100, 'in', 'mm')).toEqual(2540.0);
    expect(convertValueWith2Decimals(100, 'in', 'yd')).toEqual(2.78);
    expect(convertValueWith2Decimals(100, 'in', 'ft')).toEqual(8.33);
    expect(convertValueWith2Decimals(10, 'in', 'in')).toEqual(10.0);
    expect(convertValueWith2Decimals(100000, 'in', 'km')).toEqual(2.54);
    expect(convertValueWith2Decimals(100000, 'in', 'mi')).toEqual(1.58);

    // km to ...
    expect(convertValueWith2Decimals(1, 'km', 'm')).toEqual(1000.0);
    expect(convertValueWith2Decimals(0.001, 'km', 'cm')).toEqual(100.0);
    expect(convertValueWith2Decimals(0.001, 'km', 'mm')).toEqual(1000.0);
    expect(convertValueWith2Decimals(1, 'km', 'yd')).toEqual(1093.61);
    expect(convertValueWith2Decimals(1, 'km', 'ft')).toEqual(3280.84);
    expect(convertValueWith2Decimals(1, 'km', 'in')).toEqual(39370.1);
    expect(convertValueWith2Decimals(10, 'km', 'km')).toEqual(10.0);
    expect(convertValueWith2Decimals(10, 'km', 'mi')).toEqual(6.22);

    // mi to ...
    expect(convertValueWith2Decimals(1, 'mi', 'm')).toEqual(1609.34);
    expect(convertValueWith2Decimals(0.01, 'mi', 'cm')).toEqual(1609.34);
    expect(convertValueWith2Decimals(0.0001, 'mi', 'mm')).toEqual(160.93);
    expect(convertValueWith2Decimals(1, 'mi', 'yd')).toEqual(1760.0);
    expect(convertValueWith2Decimals(10, 'mi', 'ft')).toEqual(52799.84);
    expect(convertValueWith2Decimals(1, 'mi', 'in')).toEqual(63359.81);
    expect(convertValueWith2Decimals(10, 'mi', 'km')).toEqual(16.09);
    expect(convertValueWith2Decimals(10, 'mi', 'mi')).toEqual(10.0);

    // Temperatures

    // C to ...
    expect(convertValueWith2Decimals(25, 'c', 'c')).toEqual(25.0);
    expect(convertValueWith2Decimals(25, 'c', 'k')).toEqual(298.15);
    expect(convertValueWith2Decimals(25, 'c', 'f')).toEqual(77);

    // F to ...
    expect(convertValueWith2Decimals(100, 'f', 'c')).toEqual(37.78);
    expect(convertValueWith2Decimals(100, 'f', 'k')).toEqual(310.93);
    expect(convertValueWith2Decimals(100, 'f', 'f')).toEqual(100.0);

    // K to ...
    expect(convertValueWith2Decimals(300, 'k', 'c')).toEqual(26.85);
    expect(convertValueWith2Decimals(300, 'k', 'k')).toEqual(300.0);
    expect(convertValueWith2Decimals(300, 'k', 'f')).toEqual(80.33);

    // Volumetric Flowrates

    // m3s to ...
    expect(convertValueWith2Decimals(1, 'm3s', 'm3s')).toEqual(1.0);
    expect(convertValueWith2Decimals(1, 'm3s', 'm3min')).toEqual(60.0);
    expect(convertValueWith2Decimals(1, 'm3s', 'm3hr')).toEqual(3600.0);
    expect(convertValueWith2Decimals(1, 'm3s', 'm3d')).toEqual(86400.0);
    expect(convertValueWith2Decimals(1, 'm3s', 'bbld')).toEqual(543439.65);
    expect(convertValueWith2Decimals(1, 'm3s', 'mbbld')).toEqual(543.44);
    expect(convertValueWith2Decimals(1, 'm3s', 'mmscfd')).toEqual(3.05);

    // m3min to ...
    expect(convertValueWith2Decimals(60, 'm3min', 'm3s')).toEqual(1.0);
    expect(convertValueWith2Decimals(60, 'm3min', 'm3min')).toEqual(60.0);
    expect(convertValueWith2Decimals(60, 'm3min', 'm3hr')).toEqual(3600.0);
    expect(convertValueWith2Decimals(60, 'm3min', 'm3d')).toEqual(86400.0);
    expect(convertValueWith2Decimals(60, 'm3min', 'bbld')).toEqual(543439.65);
    expect(convertValueWith2Decimals(60, 'm3min', 'mbbld')).toEqual(543.44);
    expect(convertValueWith2Decimals(60, 'm3min', 'mmscfd')).toEqual(3.05);

    // m3hr to ...
    expect(convertValueWith2Decimals(3600, 'm3hr', 'm3s')).toEqual(1.0);
    expect(convertValueWith2Decimals(3600, 'm3hr', 'm3min')).toEqual(60.0);
    expect(convertValueWith2Decimals(3600, 'm3hr', 'm3hr')).toEqual(3600.0);
    expect(convertValueWith2Decimals(3600, 'm3hr', 'm3d')).toEqual(86400.0);
    expect(convertValueWith2Decimals(3600, 'm3hr', 'bbld')).toEqual(543439.65);
    expect(convertValueWith2Decimals(3600, 'm3hr', 'mbbld')).toEqual(543.44);
    expect(convertValueWith2Decimals(3600, 'm3hr', 'mmscfd')).toEqual(3.05);

    // m3d to ...
    expect(convertValueWith2Decimals(86400.0, 'm3d', 'm3s')).toEqual(1.0);
    expect(convertValueWith2Decimals(86400.0, 'm3d', 'm3min')).toEqual(60.0);
    expect(convertValueWith2Decimals(86400.0, 'm3d', 'm3hr')).toEqual(3600.0);
    expect(convertValueWith2Decimals(86400.0, 'm3d', 'm3d')).toEqual(86400.0);
    expect(convertValueWith2Decimals(86400.0, 'm3d', 'bbld')).toEqual(
      543439.65
    );
    expect(convertValueWith2Decimals(86400.0, 'm3d', 'mbbld')).toEqual(543.44);
    expect(convertValueWith2Decimals(86400.0, 'm3d', 'mmscfd')).toEqual(3.05);

    // bbld to ...
    expect(convertValueWith2Decimals(10000000, 'bbld', 'm3s')).toEqual(18.4);
    expect(convertValueWith2Decimals(10000000, 'bbld', 'm3min')).toEqual(
      1104.08
    );
    expect(convertValueWith2Decimals(10000000, 'bbld', 'm3hr')).toEqual(
      66244.71
    );
    expect(convertValueWith2Decimals(10000000, 'bbld', 'm3d')).toEqual(
      1589872.95
    );
    expect(convertValueWith2Decimals(100000000, 'bbld', 'bbld')).toEqual(
      100000000.0
    );
    expect(convertValueWith2Decimals(10000000, 'bbld', 'mbbld')).toEqual(
      10000.0
    );
    expect(convertValueWith2Decimals(10000000, 'bbld', 'mmscfd')).toEqual(
      56.27
    );

    // mbbld to ...
    expect(convertValueWith2Decimals(10000, 'mbbld', 'm3s')).toEqual(18.4);
    expect(convertValueWith2Decimals(10000, 'mbbld', 'm3min')).toEqual(1104.08);
    expect(convertValueWith2Decimals(10000, 'mbbld', 'm3hr')).toEqual(66244.68);
    expect(convertValueWith2Decimals(10000, 'mbbld', 'm3d')).toEqual(
      1589872.32
    );
    expect(convertValueWith2Decimals(100000, 'mbbld', 'bbld')).toEqual(
      100000000.0
    );
    expect(convertValueWith2Decimals(10000, 'mbbld', 'mbbld')).toEqual(10000.0);
    expect(convertValueWith2Decimals(10000, 'mbbld', 'mmscfd')).toEqual(56.27);

    // mmscfd to ...
    expect(convertValueWith2Decimals(1, 'mmscfd', 'm3s')).toEqual(0.33);
    expect(convertValueWith2Decimals(1, 'mmscfd', 'm3min')).toEqual(19.62);
    expect(convertValueWith2Decimals(1, 'mmscfd', 'm3hr')).toEqual(1177.17);
    expect(convertValueWith2Decimals(1, 'mmscfd', 'm3d')).toEqual(28252.08);
    expect(convertValueWith2Decimals(1, 'mmscfd', 'bbld')).toEqual(177700.59);
    expect(convertValueWith2Decimals(1, 'mmscfd', 'mbbld')).toEqual(177.7);
    expect(convertValueWith2Decimals(1, 'mmscfd', 'mmscfd')).toEqual(1.0);
  });
});

describe('unitConvertedThresolds', () => {
  it('should convert threshold units', () => {
    const thresholdCollection: ChartThreshold[] = [
      {
        id: 'fe6f69aa-e11c-4738-9a6e-2818000877ed',
        name: 'Lower Values',
        type: 'under',
        visible: true,
        lowerLimit: undefined,
        upperLimit: 19,
        filter: {},
      },
      {
        id: '1b226194-43ac-4964-a8a7-5ed26d2b867a',
        name: 'New threshold ',
        type: 'between',
        visible: true,
        lowerLimit: 29,
        upperLimit: 31,
        filter: {},
      },
    ];

    const unitConvertedThresolds = convertThresholdUnits(
      thresholdCollection,
      'c',
      'f'
    );

    expect(unitConvertedThresolds).toEqual([
      {
        id: 'fe6f69aa-e11c-4738-9a6e-2818000877ed',
        name: 'Lower Values',
        type: 'under',
        visible: true,
        lowerLimit: undefined,
        upperLimit: 66.2,
        filter: {},
      },
      {
        id: '1b226194-43ac-4964-a8a7-5ed26d2b867a',
        name: 'New threshold ',
        type: 'between',
        visible: true,
        upperLimit: 87.8,
        lowerLimit: 84.2,
        filter: {},
      },
    ]);
  });
});

describe('getUnitConvertedDatapointsSummary', () => {
  it('works for empty list of datapoints', () => {
    const datapoints: DoubleDatapoint[] = [];
    const summary = getUnitConvertedDatapointsSummary(datapoints);
    expect(summary).toEqual({
      max: undefined,
      mean: undefined,
      min: undefined,
    });
  });

  it('gives correct result for list of datapoints (raw)', () => {
    const datapoints: DoubleDatapoint[] = [
      {
        timestamp: new Date(),
        value: -10,
      },
      {
        timestamp: new Date(),
        value: 0,
      },
      {
        timestamp: new Date(),
        value: 10,
      },
    ];
    const summary = getUnitConvertedDatapointsSummary(datapoints);
    expect(summary).toEqual({ max: 10, mean: 0, min: -10 });
  });

  it('gives correct result for list of datapoints (aggregate)', () => {
    const datapoints: DatapointAggregate[] = [
      {
        timestamp: new Date(),
        min: -20,
        average: 0,
        max: 20,
        count: 100,
        sum: 1000,
      },
      {
        timestamp: new Date(),
        min: -10,
        average: 0,
        max: 10,
        count: 100,
        sum: 1000,
      },
      {
        timestamp: new Date(),
        min: -30,
        average: 0,
        max: 30,
        count: 100,
        sum: 1000,
      },
    ];
    const summary = getUnitConvertedDatapointsSummary(datapoints);
    expect(summary).toEqual({ max: 30, mean: 10, min: -30 });
  });
});
