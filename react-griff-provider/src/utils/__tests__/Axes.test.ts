import AXES from '../Axes';
import { AxisDomains } from '../../types';

describe('AXES tests', () => {
  it('should have working time axis', () => {
    expect(AXES.time({ time: [1, 2], y: [4, 5], x: [-1, 1000] })).toEqual([
      1,
      2,
    ]);
    expect(AXES.time.toString()).toEqual('time');
    expect(AXES.time((null as unknown) as AxisDomains)[0]).toEqual(0);
    expect(AXES.time((null as unknown) as AxisDomains)[1]).toEqual(0);
  });
});
