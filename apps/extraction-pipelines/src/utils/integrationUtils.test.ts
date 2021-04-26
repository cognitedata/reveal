import moment from 'moment';
import { User } from 'model/User';
import { Status } from 'model/Status';
import {
  calculate,
  calculateStatus,
  isOwner,
  partition,
} from './integrationUtils';

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
describe('partition', () => {
  test('splits', () => {
    const contacts = [
      { name: 'test' },
      { name: 'foo', role: 'Owner' },
      { name: 'owner', role: 'developer' },
    ];
    const { pass: owner, fail: other } = partition<User>(contacts, isOwner);
    expect(owner[0]).toEqual(contacts[1]);
    expect(other[0]).toEqual(contacts[0]);
    expect(other[1]).toEqual(contacts[2]);
  });
});
