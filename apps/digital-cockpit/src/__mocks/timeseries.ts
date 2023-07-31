import { Timeseries } from '@cognite/sdk';

const randomId = () => Math.round(Math.random() * 10000000);

export class MockTimeSeries {
  static single = (overwrites?: Partial<Timeseries>): Timeseries => {
    const id = randomId();
    return {
      id,
      name: `myTimeseries_${id}`,
      description: 'Time Series',
      isString: false,
      isStep: false,
      lastUpdatedTime: new Date(),
      createdTime: new Date(),
      ...overwrites,
    };
  };

  static multiple = (
    amount = 10,
    overwrites: Partial<Timeseries>[] = []
  ): Timeseries[] => {
    const result = [];
    for (let i = 0; i < amount; i++) {
      result.push(this.single(overwrites[i]));
    }
    return result;
  };
}
