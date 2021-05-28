import { DatapointAggregate, DoubleDatapoint } from '@cognite/sdk';
import { convertUnits, conversions } from './units';

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
    const quickUnitConvert = (
      from: String,
      to: String,
      value: Number
    ): Number => {
      return Number(conversions[from][to](value).toFixed(2));
    };

    // Pressures

    // PSI to ...
    expect(quickUnitConvert('psi', 'psi', 10)).toEqual(10.0);
    expect(quickUnitConvert('psi', 'bar', 10)).toEqual(0.69);
    expect(quickUnitConvert('psi', 'pa', 10)).toEqual(68947.6);
    expect(quickUnitConvert('psi', 'mpa', 10)).toEqual(0.07);
    expect(quickUnitConvert('psi', 'atm', 10)).toEqual(0.68);

    // bar to ...
    expect(quickUnitConvert('bar', 'psi', 10)).toEqual(145.04);
    expect(quickUnitConvert('bar', 'bar', 10)).toEqual(10.0);
    expect(quickUnitConvert('bar', 'pa', 1)).toEqual(100000.0);
    expect(quickUnitConvert('bar', 'mpa', 10)).toEqual(1.0);
    expect(quickUnitConvert('bar', 'atm', 1)).toEqual(0.99);

    // atm to ...
    expect(quickUnitConvert('atm', 'psi', 10)).toEqual(146.96);
    expect(quickUnitConvert('atm', 'bar', 10)).toEqual(10.13);
    expect(quickUnitConvert('atm', 'pa', 10)).toEqual(1013250.0);
    expect(quickUnitConvert('atm', 'mpa', 10)).toEqual(1.01);
    expect(quickUnitConvert('atm', 'atm', 10)).toEqual(10.0);

    // Pa to ...
    expect(quickUnitConvert('pa', 'psi', 100000)).toEqual(14.5);
    expect(quickUnitConvert('pa', 'bar', 100000)).toEqual(1.0);
    expect(quickUnitConvert('pa', 'pa', 10)).toEqual(10.0);
    expect(quickUnitConvert('pa', 'mpa', 100000)).toEqual(0.1);
    expect(quickUnitConvert('pa', 'atm', 100000)).toEqual(0.99);

    // MPa to ...
    expect(quickUnitConvert('mpa', 'psi', 1)).toEqual(145.04);
    expect(quickUnitConvert('mpa', 'bar', 1)).toEqual(10.0);
    expect(quickUnitConvert('mpa', 'pa', 1)).toEqual(1000000.0);
    expect(quickUnitConvert('mpa', 'mpa', 10)).toEqual(10.0);
    expect(quickUnitConvert('mpa', 'atm', 1)).toEqual(9.87);

    // Lengths

    // m to ...
    expect(quickUnitConvert('m', 'm', 1)).toEqual(1.0);
    expect(quickUnitConvert('m', 'cm', 1)).toEqual(100.0);
    expect(quickUnitConvert('m', 'mm', 1)).toEqual(1000.0);
    expect(quickUnitConvert('m', 'yd', 100)).toEqual(109.36);
    expect(quickUnitConvert('m', 'ft', 1)).toEqual(3.28);
    expect(quickUnitConvert('m', 'in', 1)).toEqual(39.37);
    expect(quickUnitConvert('m', 'km', 1000)).toEqual(1.0);
    expect(quickUnitConvert('m', 'mi', 100000)).toEqual(62.14);

    // cm to ...
    expect(quickUnitConvert('cm', 'm', 100)).toEqual(1.0);
    expect(quickUnitConvert('cm', 'cm', 1)).toEqual(1.0);
    expect(quickUnitConvert('cm', 'mm', 1)).toEqual(10.0);
    expect(quickUnitConvert('cm', 'yd', 100)).toEqual(1.09);
    expect(quickUnitConvert('cm', 'ft', 100)).toEqual(3.28);
    expect(quickUnitConvert('cm', 'in', 10)).toEqual(3.94);
    expect(quickUnitConvert('cm', 'km', 100000)).toEqual(1.0);
    expect(quickUnitConvert('cm', 'mi', 100000)).toEqual(0.62);

    // mm to ...
    expect(quickUnitConvert('mm', 'm', 1000)).toEqual(1.0);
    expect(quickUnitConvert('mm', 'cm', 10)).toEqual(1.0);
    expect(quickUnitConvert('mm', 'mm', 1)).toEqual(1.0);
    expect(quickUnitConvert('mm', 'yd', 1000)).toEqual(1.09);
    expect(quickUnitConvert('mm', 'ft', 10)).toEqual(0.03);
    expect(quickUnitConvert('mm', 'in', 1000)).toEqual(39.37);
    expect(quickUnitConvert('mm', 'km', 1000000)).toEqual(1.0);
    expect(quickUnitConvert('mm', 'mi', 1000000)).toEqual(0.62);

    // yd to ...
    expect(quickUnitConvert('yd', 'm', 1)).toEqual(0.91);
    expect(quickUnitConvert('yd', 'cm', 1)).toEqual(91.44);
    expect(quickUnitConvert('yd', 'mm', 1)).toEqual(914.4);
    expect(quickUnitConvert('yd', 'yd', 10)).toEqual(10.0);
    expect(quickUnitConvert('yd', 'ft', 10)).toEqual(30.0);
    expect(quickUnitConvert('yd', 'in', 1)).toEqual(36.0);
    expect(quickUnitConvert('yd', 'km', 1000)).toEqual(0.91);
    expect(quickUnitConvert('yd', 'mi', 1000)).toEqual(0.57);

    // ft to ...
    expect(quickUnitConvert('ft', 'm', 10)).toEqual(3.05);
    expect(quickUnitConvert('ft', 'cm', 10)).toEqual(304.8);
    expect(quickUnitConvert('ft', 'mm', 10)).toEqual(3048.0);
    expect(quickUnitConvert('ft', 'yd', 10)).toEqual(3.33);
    expect(quickUnitConvert('ft', 'ft', 10)).toEqual(10.0);
    expect(quickUnitConvert('ft', 'in', 10)).toEqual(120.0);
    expect(quickUnitConvert('ft', 'km', 10000)).toEqual(3.05);
    expect(quickUnitConvert('ft', 'mi', 10000)).toEqual(1.89);

    // in to ...
    expect(quickUnitConvert('in', 'm', 100)).toEqual(2.54);
    expect(quickUnitConvert('in', 'cm', 100)).toEqual(254.0);
    expect(quickUnitConvert('in', 'mm', 100)).toEqual(2540.0);
    expect(quickUnitConvert('in', 'yd', 100)).toEqual(2.78);
    expect(quickUnitConvert('in', 'ft', 100)).toEqual(8.33);
    expect(quickUnitConvert('in', 'in', 10)).toEqual(10.0);
    expect(quickUnitConvert('in', 'km', 100000)).toEqual(2.54);
    expect(quickUnitConvert('in', 'mi', 100000)).toEqual(1.58);

    // km to ...
    expect(quickUnitConvert('km', 'm', 1)).toEqual(1000.0);
    expect(quickUnitConvert('km', 'cm', 0.001)).toEqual(100.0);
    expect(quickUnitConvert('km', 'mm', 0.001)).toEqual(1000.0);
    expect(quickUnitConvert('km', 'yd', 1)).toEqual(1093.61);
    expect(quickUnitConvert('km', 'ft', 1)).toEqual(3280.84);
    expect(quickUnitConvert('km', 'in', 1)).toEqual(39370.1);
    expect(quickUnitConvert('km', 'km', 10)).toEqual(10.0);
    expect(quickUnitConvert('km', 'mi', 10)).toEqual(6.22);

    // mi to ...
    expect(quickUnitConvert('mi', 'm', 1)).toEqual(1609.34);
    expect(quickUnitConvert('mi', 'cm', 0.01)).toEqual(1609.34);
    expect(quickUnitConvert('mi', 'mm', 0.0001)).toEqual(160.93);
    expect(quickUnitConvert('mi', 'yd', 1)).toEqual(1760.0);
    expect(quickUnitConvert('mi', 'ft', 10)).toEqual(52799.84);
    expect(quickUnitConvert('mi', 'in', 1)).toEqual(63359.81);
    expect(quickUnitConvert('mi', 'km', 10)).toEqual(16.09);
    expect(quickUnitConvert('mi', 'mi', 10)).toEqual(10.0);

    // Temperatures

    // C to ...
    expect(quickUnitConvert('C', 'C', 25)).toEqual(25.0);
    expect(quickUnitConvert('C', 'K', 25)).toEqual(298.15);
    expect(quickUnitConvert('C', 'F', 25)).toEqual(77);

    // F to ...
    expect(quickUnitConvert('F', 'C', 100)).toEqual(37.78);
    expect(quickUnitConvert('F', 'K', 100)).toEqual(310.93);
    expect(quickUnitConvert('F', 'F', 100)).toEqual(100.0);

    // K to ...
    expect(quickUnitConvert('K', 'C', 300)).toEqual(26.85);
    expect(quickUnitConvert('K', 'K', 300)).toEqual(300.0);
    expect(quickUnitConvert('K', 'F', 300)).toEqual(80.33);

    // Volumetric Flowrates

    // m3s to ...
    expect(quickUnitConvert('m3s', 'm3s', 1)).toEqual(1.0);
    expect(quickUnitConvert('m3s', 'm3min', 1)).toEqual(60.0);
    expect(quickUnitConvert('m3s', 'm3hr', 1)).toEqual(3600.0);
    expect(quickUnitConvert('m3s', 'm3d', 1)).toEqual(86400.0);
    expect(quickUnitConvert('m3s', 'bbld', 1)).toEqual(543439.65);
    expect(quickUnitConvert('m3s', 'mbbld', 1)).toEqual(543.44);
    expect(quickUnitConvert('m3s', 'mmscfd', 1)).toEqual(3.05);

    // m3min to ...
    expect(quickUnitConvert('m3min', 'm3s', 60)).toEqual(1.0);
    expect(quickUnitConvert('m3min', 'm3min', 60)).toEqual(60.0);
    expect(quickUnitConvert('m3min', 'm3hr', 60)).toEqual(3600.0);
    expect(quickUnitConvert('m3min', 'm3d', 60)).toEqual(86400.0);
    expect(quickUnitConvert('m3min', 'bbld', 60)).toEqual(543439.65);
    expect(quickUnitConvert('m3min', 'mbbld', 60)).toEqual(543.44);
    expect(quickUnitConvert('m3min', 'mmscfd', 60)).toEqual(3.05);

    // m3hr to ...
    expect(quickUnitConvert('m3hr', 'm3s', 3600)).toEqual(1.0);
    expect(quickUnitConvert('m3hr', 'm3min', 3600)).toEqual(60.0);
    expect(quickUnitConvert('m3hr', 'm3hr', 3600)).toEqual(3600.0);
    expect(quickUnitConvert('m3hr', 'm3d', 3600)).toEqual(86400.0);
    expect(quickUnitConvert('m3hr', 'bbld', 3600)).toEqual(543439.65);
    expect(quickUnitConvert('m3hr', 'mbbld', 3600)).toEqual(543.44);
    expect(quickUnitConvert('m3hr', 'mmscfd', 3600)).toEqual(3.05);

    // m3d to ...
    expect(quickUnitConvert('m3d', 'm3s', 86400.0)).toEqual(1.0);
    expect(quickUnitConvert('m3d', 'm3min', 86400.0)).toEqual(60.0);
    expect(quickUnitConvert('m3d', 'm3hr', 86400.0)).toEqual(3600.0);
    expect(quickUnitConvert('m3d', 'm3d', 86400.0)).toEqual(86400.0);
    expect(quickUnitConvert('m3d', 'bbld', 86400.0)).toEqual(543439.65);
    expect(quickUnitConvert('m3d', 'mbbld', 86400.0)).toEqual(543.44);
    expect(quickUnitConvert('m3d', 'mmscfd', 86400.0)).toEqual(3.05);

    // bbld to ...
    expect(quickUnitConvert('bbld', 'm3s', 10000000)).toEqual(18.4);
    expect(quickUnitConvert('bbld', 'm3min', 10000000)).toEqual(1104.08);
    expect(quickUnitConvert('bbld', 'm3hr', 10000000)).toEqual(66244.71);
    expect(quickUnitConvert('bbld', 'm3d', 10000000)).toEqual(1589872.95);
    expect(quickUnitConvert('bbld', 'bbld', 100000000)).toEqual(100000000.0);
    expect(quickUnitConvert('bbld', 'mbbld', 10000000)).toEqual(10000.0);
    expect(quickUnitConvert('bbld', 'mmscfd', 10000000)).toEqual(56.27);

    // mbbld to ...
    expect(quickUnitConvert('mbbld', 'm3s', 10000)).toEqual(18.4);
    expect(quickUnitConvert('mbbld', 'm3min', 10000)).toEqual(1104.08);
    expect(quickUnitConvert('mbbld', 'm3hr', 10000)).toEqual(66244.68);
    expect(quickUnitConvert('mbbld', 'm3d', 10000)).toEqual(1589872.32);
    expect(quickUnitConvert('mbbld', 'bbld', 100000)).toEqual(100000000.0);
    expect(quickUnitConvert('mbbld', 'mbbld', 10000)).toEqual(10000.0);
    expect(quickUnitConvert('mbbld', 'mmscfd', 10000)).toEqual(56.27);

    // mmscfd to ...
    expect(quickUnitConvert('mmscfd', 'm3s', 1)).toEqual(0.33);
    expect(quickUnitConvert('mmscfd', 'm3min', 1)).toEqual(19.62);
    expect(quickUnitConvert('mmscfd', 'm3hr', 1)).toEqual(1177.17);
    expect(quickUnitConvert('mmscfd', 'm3d', 1)).toEqual(28252.08);
    expect(quickUnitConvert('mmscfd', 'bbld', 1)).toEqual(177700.59);
    expect(quickUnitConvert('mmscfd', 'mbbld', 1)).toEqual(177.7);
    expect(quickUnitConvert('mmscfd', 'mmscfd', 1)).toEqual(1.0);
  });
});
