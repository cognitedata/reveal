import { DatapointAggregate, DoubleDatapoint } from '@cognite/sdk';
import { convertUnits, convertValue } from './units';

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

  it('check all conversions', () => {
    // Pressures

    // PSI to ...
    expect(convertValue(10, 'psi', 'psi')).toEqual(10.0);
    expect(convertValue(10, 'psi', 'bar')).toEqual(0.69);
    expect(convertValue(10, 'psi', 'pa')).toEqual(68947.6);
    expect(convertValue(10, 'psi', 'mpa')).toEqual(0.07);
    expect(convertValue(10, 'psi', 'atm')).toEqual(0.68);

    // bar to ...
    expect(convertValue(10, 'bar', 'psi')).toEqual(145.04);
    expect(convertValue(10, 'bar', 'bar')).toEqual(10.0);
    expect(convertValue(1, 'bar', 'pa')).toEqual(100000.0);
    expect(convertValue(10, 'bar', 'mpa')).toEqual(1.0);
    expect(convertValue(1, 'bar', 'atm')).toEqual(0.99);

    // atm to ...
    expect(convertValue(10, 'atm', 'psi')).toEqual(146.96);
    expect(convertValue(10, 'atm', 'bar')).toEqual(10.13);
    expect(convertValue(10, 'atm', 'pa')).toEqual(1013250.0);
    expect(convertValue(10, 'atm', 'mpa')).toEqual(1.01);
    expect(convertValue(10, 'atm', 'atm')).toEqual(10.0);

    // Pa to ...
    expect(convertValue(100000, 'pa', 'psi')).toEqual(14.5);
    expect(convertValue(100000, 'pa', 'bar')).toEqual(1.0);
    expect(convertValue(10, 'pa', 'pa')).toEqual(10.0);
    expect(convertValue(100000, 'pa', 'mpa')).toEqual(0.1);
    expect(convertValue(100000, 'pa', 'atm')).toEqual(0.99);

    // MPa to ...
    expect(convertValue(1, 'mpa', 'psi')).toEqual(145.04);
    expect(convertValue(1, 'mpa', 'bar')).toEqual(10.0);
    expect(convertValue(1, 'mpa', 'pa')).toEqual(1000000.0);
    expect(convertValue(10, 'mpa', 'mpa')).toEqual(10.0);
    expect(convertValue(1, 'mpa', 'atm')).toEqual(9.87);

    // Lengths

    // m to ...
    expect(convertValue(1, 'm', 'm')).toEqual(1.0);
    expect(convertValue(1, 'm', 'cm')).toEqual(100.0);
    expect(convertValue(1, 'm', 'mm')).toEqual(1000.0);
    expect(convertValue(100, 'm', 'yd')).toEqual(109.36);
    expect(convertValue(1, 'm', 'ft')).toEqual(3.28);
    expect(convertValue(1, 'm', 'in')).toEqual(39.37);
    expect(convertValue(1000, 'm', 'km')).toEqual(1.0);
    expect(convertValue(100000, 'm', 'mi')).toEqual(62.14);

    // cm to ...
    expect(convertValue(100, 'cm', 'm')).toEqual(1.0);
    expect(convertValue(1, 'cm', 'cm')).toEqual(1.0);
    expect(convertValue(1, 'cm', 'mm')).toEqual(10.0);
    expect(convertValue(100, 'cm', 'yd')).toEqual(1.09);
    expect(convertValue(100, 'cm', 'ft')).toEqual(3.28);
    expect(convertValue(10, 'cm', 'in')).toEqual(3.94);
    expect(convertValue(100000, 'cm', 'km')).toEqual(1.0);
    expect(convertValue(100000, 'cm', 'mi')).toEqual(0.62);

    // mm to ...
    expect(convertValue(1000, 'mm', 'm')).toEqual(1.0);
    expect(convertValue(10, 'mm', 'cm')).toEqual(1.0);
    expect(convertValue(1, 'mm', 'mm')).toEqual(1.0);
    expect(convertValue(1000, 'mm', 'yd')).toEqual(1.09);
    expect(convertValue(10, 'mm', 'ft')).toEqual(0.03);
    expect(convertValue(1000, 'mm', 'in')).toEqual(39.37);
    expect(convertValue(1000000, 'mm', 'km')).toEqual(1.0);
    expect(convertValue(1000000, 'mm', 'mi')).toEqual(0.62);

    // yd to ...
    expect(convertValue(1, 'yd', 'm')).toEqual(0.91);
    expect(convertValue(1, 'yd', 'cm')).toEqual(91.44);
    expect(convertValue(1, 'yd', 'mm')).toEqual(914.4);
    expect(convertValue(10, 'yd', 'yd')).toEqual(10.0);
    expect(convertValue(10, 'yd', 'ft')).toEqual(30.0);
    expect(convertValue(1, 'yd', 'in')).toEqual(36.0);
    expect(convertValue(1000, 'yd', 'km')).toEqual(0.91);
    expect(convertValue(1000, 'yd', 'mi')).toEqual(0.57);

    // ft to ...
    expect(convertValue(10, 'ft', 'm')).toEqual(3.05);
    expect(convertValue(10, 'ft', 'cm')).toEqual(304.8);
    expect(convertValue(10, 'ft', 'mm')).toEqual(3048.0);
    expect(convertValue(10, 'ft', 'yd')).toEqual(3.33);
    expect(convertValue(10, 'ft', 'ft')).toEqual(10.0);
    expect(convertValue(10, 'ft', 'in')).toEqual(120.0);
    expect(convertValue(10000, 'ft', 'km')).toEqual(3.05);
    expect(convertValue(10000, 'ft', 'mi')).toEqual(1.89);

    // in to ...
    expect(convertValue(100, 'in', 'm')).toEqual(2.54);
    expect(convertValue(100, 'in', 'cm')).toEqual(254.0);
    expect(convertValue(100, 'in', 'mm')).toEqual(2540.0);
    expect(convertValue(100, 'in', 'yd')).toEqual(2.78);
    expect(convertValue(100, 'in', 'ft')).toEqual(8.33);
    expect(convertValue(10, 'in', 'in')).toEqual(10.0);
    expect(convertValue(100000, 'in', 'km')).toEqual(2.54);
    expect(convertValue(100000, 'in', 'mi')).toEqual(1.58);

    // km to ...
    expect(convertValue(1, 'km', 'm')).toEqual(1000.0);
    expect(convertValue(0.001, 'km', 'cm')).toEqual(100.0);
    expect(convertValue(0.001, 'km', 'mm')).toEqual(1000.0);
    expect(convertValue(1, 'km', 'yd')).toEqual(1093.61);
    expect(convertValue(1, 'km', 'ft')).toEqual(3280.84);
    expect(convertValue(1, 'km', 'in')).toEqual(39370.1);
    expect(convertValue(10, 'km', 'km')).toEqual(10.0);
    expect(convertValue(10, 'km', 'mi')).toEqual(6.22);

    // mi to ...
    expect(convertValue(1, 'mi', 'm')).toEqual(1609.34);
    expect(convertValue(0.01, 'mi', 'cm')).toEqual(1609.34);
    expect(convertValue(0.0001, 'mi', 'mm')).toEqual(160.93);
    expect(convertValue(1, 'mi', 'yd')).toEqual(1760.0);
    expect(convertValue(10, 'mi', 'ft')).toEqual(52799.84);
    expect(convertValue(1, 'mi', 'in')).toEqual(63359.81);
    expect(convertValue(10, 'mi', 'km')).toEqual(16.09);
    expect(convertValue(10, 'mi', 'mi')).toEqual(10.0);

    // Temperatures

    // C to ...
    expect(convertValue(25, 'C', 'C')).toEqual(25.0);
    expect(convertValue(25, 'C', 'K')).toEqual(298.15);
    expect(convertValue(25, 'C', 'F')).toEqual(77);

    // F to ...
    expect(convertValue(100, 'F', 'C')).toEqual(37.78);
    expect(convertValue(100, 'F', 'K')).toEqual(310.93);
    expect(convertValue(100, 'F', 'F')).toEqual(100.0);

    // K to ...
    expect(convertValue(300, 'K', 'C')).toEqual(26.85);
    expect(convertValue(300, 'K', 'K')).toEqual(300.0);
    expect(convertValue(300, 'K', 'F')).toEqual(80.33);

    // Volumetric Flowrates

    // m3s to ...
    expect(convertValue(1, 'm3s', 'm3s')).toEqual(1.0);
    expect(convertValue(1, 'm3s', 'm3min')).toEqual(60.0);
    expect(convertValue(1, 'm3s', 'm3hr')).toEqual(3600.0);
    expect(convertValue(1, 'm3s', 'm3d')).toEqual(86400.0);
    expect(convertValue(1, 'm3s', 'bbld')).toEqual(543439.65);
    expect(convertValue(1, 'm3s', 'mbbld')).toEqual(543.44);
    expect(convertValue(1, 'm3s', 'mmscfd')).toEqual(3.05);

    // m3min to ...
    expect(convertValue(60, 'm3min', 'm3s')).toEqual(1.0);
    expect(convertValue(60, 'm3min', 'm3min')).toEqual(60.0);
    expect(convertValue(60, 'm3min', 'm3hr')).toEqual(3600.0);
    expect(convertValue(60, 'm3min', 'm3d')).toEqual(86400.0);
    expect(convertValue(60, 'm3min', 'bbld')).toEqual(543439.65);
    expect(convertValue(60, 'm3min', 'mbbld')).toEqual(543.44);
    expect(convertValue(60, 'm3min', 'mmscfd')).toEqual(3.05);

    // m3hr to ...
    expect(convertValue(3600, 'm3hr', 'm3s')).toEqual(1.0);
    expect(convertValue(3600, 'm3hr', 'm3min')).toEqual(60.0);
    expect(convertValue(3600, 'm3hr', 'm3hr')).toEqual(3600.0);
    expect(convertValue(3600, 'm3hr', 'm3d')).toEqual(86400.0);
    expect(convertValue(3600, 'm3hr', 'bbld')).toEqual(543439.65);
    expect(convertValue(3600, 'm3hr', 'mbbld')).toEqual(543.44);
    expect(convertValue(3600, 'm3hr', 'mmscfd')).toEqual(3.05);

    // m3d to ...
    expect(convertValue(86400.0, 'm3d', 'm3s')).toEqual(1.0);
    expect(convertValue(86400.0, 'm3d', 'm3min')).toEqual(60.0);
    expect(convertValue(86400.0, 'm3d', 'm3hr')).toEqual(3600.0);
    expect(convertValue(86400.0, 'm3d', 'm3d')).toEqual(86400.0);
    expect(convertValue(86400.0, 'm3d', 'bbld')).toEqual(543439.65);
    expect(convertValue(86400.0, 'm3d', 'mbbld')).toEqual(543.44);
    expect(convertValue(86400.0, 'm3d', 'mmscfd')).toEqual(3.05);

    // bbld to ...
    expect(convertValue(10000000, 'bbld', 'm3s')).toEqual(18.4);
    expect(convertValue(10000000, 'bbld', 'm3min')).toEqual(1104.08);
    expect(convertValue(10000000, 'bbld', 'm3hr')).toEqual(66244.71);
    expect(convertValue(10000000, 'bbld', 'm3d')).toEqual(1589872.95);
    expect(convertValue(100000000, 'bbld', 'bbld')).toEqual(100000000.0);
    expect(convertValue(10000000, 'bbld', 'mbbld')).toEqual(10000.0);
    expect(convertValue(10000000, 'bbld', 'mmscfd')).toEqual(56.27);

    // mbbld to ...
    expect(convertValue(10000, 'mbbld', 'm3s')).toEqual(18.4);
    expect(convertValue(10000, 'mbbld', 'm3min')).toEqual(1104.08);
    expect(convertValue(10000, 'mbbld', 'm3hr')).toEqual(66244.68);
    expect(convertValue(10000, 'mbbld', 'm3d')).toEqual(1589872.32);
    expect(convertValue(100000, 'mbbld', 'bbld')).toEqual(100000000.0);
    expect(convertValue(10000, 'mbbld', 'mbbld')).toEqual(10000.0);
    expect(convertValue(10000, 'mbbld', 'mmscfd')).toEqual(56.27);

    // mmscfd to ...
    expect(convertValue(1, 'mmscfd', 'm3s')).toEqual(0.33);
    expect(convertValue(1, 'mmscfd', 'm3min')).toEqual(19.62);
    expect(convertValue(1, 'mmscfd', 'm3hr')).toEqual(1177.17);
    expect(convertValue(1, 'mmscfd', 'm3d')).toEqual(28252.08);
    expect(convertValue(1, 'mmscfd', 'bbld')).toEqual(177700.59);
    expect(convertValue(1, 'mmscfd', 'mbbld')).toEqual(177.7);
    expect(convertValue(1, 'mmscfd', 'mmscfd')).toEqual(1.0);
  });
});
