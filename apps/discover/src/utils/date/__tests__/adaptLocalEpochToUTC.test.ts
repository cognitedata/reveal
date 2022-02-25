import { adaptLocalEpochToUTC } from '../adaptLocalEpochToUTC';

describe('adaptLocalEpochToUTC', () => {
  test('should adapt local epoch to local utc', () => {
    const utc = adaptLocalEpochToUTC(0);
    const offset = new Date().getTimezoneOffset();
    expect(utc).toEqual(0 - offset * 60 * 1000);
  });
});
