import moment from 'moment';
import { isDateDiffLessThanDays } from './dateUtils';

describe('dateUtils', () => {
  const cases = [
    {
      desc: '2020-03-13',
      value: 1584137100000,
      numberOfDays: 1,
      expected: false,
    },
    { desc: 'Now', value: moment(), numberOfDays: 1, expected: true },
  ];
  cases.forEach(({ desc, value, numberOfDays, expected }) => {
    test(`isDateDiffLessThanDays - ${desc}`, () => {
      // @ts-ignore
      const res = isDateDiffLessThanDays(value, numberOfDays, 'days');
      expect(res).toEqual(expected);
    });
  });
});
