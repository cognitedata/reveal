import { parseCron } from './cronUtils';

describe('Cron Utils', () => {
  const cases = [
    {
      value: '0 0 9 1/1 * ? *',
      expected: 'At 09:00 AM',
    },
    { value: '0 0 9 * *', expected: 'At 12:00 AM, on day 9 of the month' },
    { value: '15 15 * * *', expected: 'At 03:15 PM' },
    { value: '43 15 * * 1', expected: 'At 03:43 PM, only on Monday' },
    { value: '34 4 11 * *', expected: 'At 04:34 AM, on day 11 of the month' },
    {
      value: '34 4 * 10 5',
      expected: 'At 04:34 AM, only on Friday, only in October',
    },
  ];
  cases.forEach(({ value, expected }) => {
    test(`Should parse ${value} to ${expected}`, () => {
      const res = parseCron(value);
      expect(res).toEqual(expected);
    });
  });
});
