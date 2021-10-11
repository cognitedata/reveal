import {
  mdValues,
  mockLogDataMD,
  mockLogDataTVD,
  sequence,
} from '__test-utils/fixtures/log';

import {
  getClosestValue,
  getScaleHandler,
  getTrackUnit,
  sortTuples,
} from '../utils';

describe('Log viewer utils', () => {
  it(`should return domain for md`, () => {
    const { scaleHandler, domain } = getScaleHandler(mockLogDataMD);

    expect(domain).toEqual(mdValues);
    expect(scaleHandler).toBeNull();
  });

  it(`should return domain and scaler handler for tvd`, () => {
    const { scaleHandler, domain } = getScaleHandler({
      ...mockLogDataMD,
      ...mockLogDataTVD,
    });

    expect(domain).toEqual(mdValues);
    expect(scaleHandler?.range()).toEqual(mdValues);
  });

  it(`should return closest value`, () => {
    const value = getClosestValue([1, 2, 3], 2);
    expect(value).toEqual(2);

    const higherValue = getClosestValue([1, 2, 3], 5);
    expect(higherValue).toEqual(3);

    const lowerValue = getClosestValue([1, 2, 3], 0);
    expect(lowerValue).toEqual(1);
  });

  it(`should return track units`, () => {
    const value = getTrackUnit(sequence, 'Log');
    expect(value).toEqual('ft');

    const invlaidvalue = getTrackUnit(sequence, '');
    expect(invlaidvalue).toEqual('');
  });

  it(`should return sort values`, () => {
    const value = sortTuples([
      [6, 1],
      [2, 4],
      [3, 6],
    ]);

    expect(value).toEqual([
      [2, 4],
      [3, 6],
      [6, 1],
    ]);
  });
});
