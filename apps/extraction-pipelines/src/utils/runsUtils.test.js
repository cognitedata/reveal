import moment from 'moment';
import { filterByTimeBetween, isWithinDaysInThePast } from 'utils/runsUtils';

describe('runsUtils', () => {
  test('filterByTimeBetween', () => {
    const isWithinTwoDaysInThePast = filterByTimeBetween(
      moment().subtract(2, 'days'),
      moment()
    );
    const res = isWithinTwoDaysInThePast({
      createdTime: moment().subtract(1, 'hour').valueOf(),
    });
    expect(res).toEqual(true);
  });

  test('isWithinDaysInThePast', () => {
    const isWithinAWeekInThePast = isWithinDaysInThePast(7);
    const res = isWithinAWeekInThePast({
      createdTime: moment().subtract(2, 'days').valueOf(),
    });
    expect(res).toEqual(true);
  });
});
