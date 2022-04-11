import moment from 'moment';
import { RunStatusUI } from 'model/Status';
import { SupportedScheduleStrings } from 'components/extpipes/cols/Schedule';
import {
  calculate,
  calculateLatest,
  calculateStatus,
  createAddExtpipeInfo,
  createSearchParams,
  isOwner,
  partition,
} from './extpipeUtils';

describe('Extpipe utils', () => {
  const cases = [
    {
      desc: 'Should return SUCCESS when last succsess is the most recent - ',
      statuses: {
        lastSuccess: moment().valueOf(),
        lastFailure: moment().subtract(2, 'minutes').valueOf(),
      },
      expected: RunStatusUI.SUCCESS,
    },
    {
      desc: 'Should return SUCCESS when last success is the most recent - days',
      statuses: {
        lastSuccess: moment().valueOf(),
        lastFailure: moment().subtract(2, 'days').valueOf(),
      },
      expected: RunStatusUI.SUCCESS,
    },
    {
      desc:
        'Should return SUCCESS when last success is the most recent - milliseconds',
      statuses: {
        lastSuccess: moment().valueOf(),
        lastFailure: moment().subtract(2, 'milliseconds').valueOf(),
      },
      expected: RunStatusUI.SUCCESS,
    },
    {
      desc:
        'Should return FAILURE when the timestamp for success and fail is the same ',
      statuses: {
        lastSuccess: moment('2020-11-16 12:00:00').valueOf(),
        lastFailure: moment('2020-11-16 12:00:00').valueOf(),
      },
      expected: RunStatusUI.FAILURE,
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
    expect(res.status).toEqual(RunStatusUI.FAILURE);
  });

  const suites = [
    {
      desc: 'NOT_ACTIVATED for lastSuccess and lastFailure is 0',
      value: { lastFailure: 0, lastSuccess: 0 },
      expected: RunStatusUI.NOT_ACTIVATED,
    },
    {
      desc: 'SUCCESS for lastSuccess is defined and lastFailure is 0',
      value: { lastFailure: 0, lastSuccess: 1584066900000 },
      expected: RunStatusUI.SUCCESS,
    },
    {
      desc: 'FAILURE for lastFailure is defined and lastSuccess is 0',
      value: { lastFailure: 1584066900000, lastSuccess: 0 },
      expected: RunStatusUI.FAILURE,
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
    const { pass: owner, fail: other } = partition(contacts, isOwner);
    expect(owner[0]).toEqual(contacts[1]);
    expect(other[0]).toEqual(contacts[0]);
    expect(other[1]).toEqual(contacts[2]);
  });
});

describe('createAddExtpipeInfo', () => {
  const cases = [
    {
      desc: 'Only required values',
      values: {
        name: 'extpipe name',
        externalId: 'my_external_id',
        dataSetId: 123123123,
      },
      expected: {
        name: 'extpipe name',
        externalId: 'my_external_id',
        dataSetId: 123123123,
      },
    },
    {
      desc: 'All values',
      values: {
        name: 'extpipe name',
        externalId: 'my_external_id',
        dataSetId: 123123123,
        documentation: 'This is the documentation',
        metadata: [
          { description: 'Doc Link', content: 'https://docs.cognite.com' },
        ],
        description: 'This is the description',
        schedule: SupportedScheduleStrings.SCHEDULED,
        cron: '1 1 * * *',
        selectedRawTables: [{ dbName: 'thisDb', tableName: 'dbtable' }],
        contacts: [
          { name: 'Test Testsen', email: 'test@test.no', role: 'Tester' },
        ],
        skipNotificationInHours: 1,
        user: { displayName: 'Creator Name' },
      },
      expected: {
        name: 'extpipe name',
        externalId: 'my_external_id',
        dataSetId: 123123123,
        documentation: 'This is the documentation',
        metadata: {
          docLink: 'https://docs.cognite.com',
        },
        description: 'This is the description',
        schedule: '1 1 * * *',
        rawTables: [{ dbName: 'thisDb', tableName: 'dbtable' }],
        contacts: [
          { name: 'Test Testsen', email: 'test@test.no', role: 'Tester' },
        ],
        createdBy: 'Creator Name',
      },
    },
  ];
  cases.forEach(({ desc, values: { user, ...values }, expected }) => {
    test(`Creates extpipe info with: ${desc}`, () => {
      const res = createAddExtpipeInfo(values, user);
      expect(res).toEqual(expected);
    });
  });

  test('Sets data set id from field when no data set model exist', () => {
    const res = createAddExtpipeInfo(cases[0].values, null);
    expect(res.dataSetId).toEqual(cases[0].values.dataSetId);
  });
});

describe('createSearchParams', () => {
  test('Creates params', () => {
    const options = {
      search: 'foo',
      statuses: ['success'],
      dateRange: {
        startDate: new Date(2021, 5, 1, 0, 0),
        endDate: new Date(2021, 5, 3, 20, 33),
      },
    };
    const res = createSearchParams(options);
    expect(res.includes('search')).toEqual(true);
    expect(res.includes(options.search)).toEqual(true);
    expect(res.includes('statuses')).toEqual(true);
    expect(res.includes(options.statuses)).toEqual(true);
    expect(res.includes('min')).toEqual(true);
    expect(res.includes(options.dateRange.startDate.getTime())).toEqual(true);
    expect(res.includes('max')).toEqual(true);
    expect(res.includes(options.dateRange.endDate.getTime())).toEqual(true);
  });
});
describe('calculateLastConnected', () => {
  const lastSeen = new Date(2021, 4, 1, 10, 1).getTime();
  const lastSuccess = new Date(2021, 4, 1, 10, 0).getTime();
  const lastFailure = new Date(2021, 4, 1, 9, 1).getTime();
  const lastSuccess2 = new Date(2021, 4, 1, 10, 10).getTime();
  const cases = [
    {
      values: [lastSeen, lastSuccess, lastFailure],
      expected: lastSeen,
    },
    {
      values: [lastSeen, lastSuccess2, lastFailure],
      expected: lastSuccess2,
    },
  ];
  cases.forEach(({ values, expected }) => {
    test(`Get the latest`, () => {
      const res = calculateLatest(values);
      expect(res).toEqual(expected);
    });
  });
});
