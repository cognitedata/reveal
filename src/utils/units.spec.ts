import { DatapointAggregate, DoubleDatapoint } from '@cognite/sdk';
import { convertUnits } from './units';

describe('convertUnits', () => {
  it('should convert units successfully (double data points)', async () => {
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

    const output = await convertUnits(datapoints, inputUnit, outputUnit);

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

  it('should convert units successfully (aggregate data points)', async () => {
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

    const output = await convertUnits(datapoints, inputUnit, outputUnit);

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
});
