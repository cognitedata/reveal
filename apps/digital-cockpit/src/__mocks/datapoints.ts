import { Datapoints, DoubleDatapoint, Timeseries } from '@cognite/sdk';

const randomId = () => Math.round(Math.random() * 10000000);

export class MockDatapoints {
  static singleDatapoint = (i: number): DoubleDatapoint => {
    return {
      value: Math.random() * 100,
      timestamp: new Date(Date.now() - i * 1000 * 60 * 60 * 24),
    };
  };
  static datapoint = (amount = 10): Datapoints => {
    const id = randomId();
    const datapoints = [];
    for (let i = 0; i < amount; i++) {
      datapoints.push(this.singleDatapoint(i));
    }
    return {
      id,
      isString: false,
      datapoints,
    };
  };
}
