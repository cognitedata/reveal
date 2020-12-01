import moment from 'moment';
import { calculate, calculateStatus } from './integrationUtils';
import { Status } from '../model/Status';

describe('Integration utils', () => {
  const cases = [
    {
      desc: 'Should return OK when last succsess is the most recent - ',
      statuses: {
        lastSuccess: moment().valueOf(),
        lastFailure: moment().subtract(2, 'minutes').valueOf(),
      },
      expected: Status.OK,
    },
    {
      desc: 'Should return OK when last succsess is the most recent - days',
      statuses: {
        lastSuccess: moment().valueOf(),
        lastFailure: moment().subtract(2, 'days').valueOf(),
      },
      expected: Status.OK,
    },
    {
      desc:
        'Should return OK when last succsess is the most recent - milliseconds',
      statuses: {
        lastSuccess: moment().valueOf(),
        lastFailure: moment().subtract(2, 'milliseconds').valueOf(),
      },
      expected: Status.OK,
    },
    {
      desc:
        'Should return FAIL when the timestamp for success and fail is the same ',
      statuses: {
        lastSuccess: moment('2020-11-16 12:00:00').valueOf(),
        lastFailure: moment('2020-11-16 12:00:00').valueOf(),
      },
      expected: Status.FAIL,
    },
  ];

  cases.forEach(({ desc, statuses, expected }) => {
    test(`${desc}`, () => {
      const res = calculate(statuses);
      expect(res.status).toEqual(expected);
    });
  });

  test('Should return failure when last failure is the most recent', () => {
    const statuses = {
      lastSuccess: moment().subtract(2, 'days').valueOf(),
      lastFailure: moment().valueOf(),
    };
    const res = calculate(statuses);
    expect(res.status).toEqual(Status.FAIL);
  });

  const suites = [
    {
      desc: 'NOT_STARTED for lastSuccess and lastFailure is 0',
      value: { lastFailure: 0, lastSuccess: 0 },
      expected: Status.NOT_ACTIVATED,
    },
    {
      desc: 'OK for lastSuccess is defined and lastFailure is 0',
      value: { lastFailure: 0, lastSuccess: 1584066900000 },
      expected: Status.OK,
    },
    {
      desc: 'FAIL for lastFailure is defined and lastSuccess is 0',
      value: { lastFailure: 1584066900000, lastSuccess: 0 },
      expected: Status.FAIL,
    },
  ];
  suites.forEach(({ desc, value, expected }) => {
    test(`Should return status ${desc}`, () => {
      const res = calculateStatus(value);
      expect(res.status).toEqual(expected);
    });
  });
});
