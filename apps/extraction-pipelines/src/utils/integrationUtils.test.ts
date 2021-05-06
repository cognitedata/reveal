import moment from 'moment';
import { User } from 'model/User';
import { Status } from 'model/Status';
import { MIN_IN_HOURS } from 'utils/validation/notificationValidation';
import { SupportedScheduleStrings } from 'components/integrations/cols/Schedule';
import {
  calculate,
  calculateStatus,
  createAddIntegrationInfo,
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

describe('createAddIntegrationInfo', () => {
  const cases = [
    {
      desc: 'Only required valued',
      values: {
        name: 'integration name',
        externalId: 'my_external_id',
        dataSetId: 123123123,
      },
      expected: {
        name: 'integration name',
        externalId: 'my_external_id',
        dataSetId: 123123123,
      },
    },
    {
      desc: 'All values',
      values: {
        name: 'integration name',
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
      },
      expected: {
        name: 'integration name',
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
        skipNotificationsInMinutes: 1 * MIN_IN_HOURS,
      },
    },
  ];
  cases.forEach(({ desc, values, expected }) => {
    test(`Creates integration info with: ${desc}`, () => {
      const res = createAddIntegrationInfo(values, {
        name: 'this data set',
        id: values.dataSetId,
      });
      expect(res).toEqual(expected);
    });
  });
});
