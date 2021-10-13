import { isValidContactListAfterRemove } from './contactValidation';

describe('ContactValidation', () => {
  const cases = [
    {
      desc: 'Should return true when two contacts left',
      integration: {
        contacts: [
          {
            name: 'test',
            email: 'test@test.no',
            sendNotification: true,
          },
          {
            name: 'test',
            email: 'test@test.no',
            sendNotification: true,
          },
          {
            name: 'foo',
            email: 'foo@test.no',
            sendNotification: true,
          },
        ],
      },
      indexToRemove: 0,
      expected: true,
    },
    {
      desc:
        'Should return true when removing and the one left has send notification',
      integration: {
        contacts: [
          {
            name: 'test',
            email: 'test@test.no',
            sendNotification: true,
          },
          {
            name: 'foo',
            email: 'foo@test.no',
          },
        ],
      },
      indexToRemove: 1,
      expected: true,
    },
    {
      desc:
        'Should return true when removing and 1 remaining contacts have notification',
      integration: {
        contacts: [
          {
            name: 'test',
            email: 'test@test.no',
            sendNotification: true,
          },
          {
            name: 'foo',
            email: 'foo@test.no',
          },
          {
            name: 'foo',
            email: 'foo@test.no',
          },
        ],
      },
      indexToRemove: 1,
      expected: true,
    },
    {
      desc: 'Should return false when integration is undefined',
      integration: undefined,
      indexToRemove: 0,
      expected: false,
    },
    {
      desc: 'Should return false when contacts is empty',
      integration: { contacts: [] },
      indexToRemove: 0,
      expected: false,
    },

    {
      desc: 'Should return false when one contacts left',
      integration: {
        contacts: [
          {
            name: 'test',
            email: 'test@test.no',
            sendNotification: true,
          },
        ],
      },
      indexToRemove: 0,
      expected: false,
    },
    {
      desc: 'Should return false when one contacts left with notification',
      integration: {
        contacts: [
          {
            name: 'test',
            email: 'test@test.no',
            sendNotification: true,
          },
          {
            name: 'test',
            email: 'test@test.no',
          },
        ],
      },
      indexToRemove: 0,
      expected: false,
    },
    {
      desc: 'Should return false when one contacts left without notification',
      integration: {
        contacts: [
          {
            name: 'test',
            email: 'test@test.no',
            sendNotification: true,
          },
          {
            name: 'test',
            email: 'test@test.no',
          },
        ],
      },
      indexToRemove: 0,
      expected: false,
    },
    {
      desc: 'Should return false when no contacts have send notification',
      integration: {
        contacts: [
          {
            name: 'test',
            email: 'test@test.no',
          },
          {
            name: 'foo',
            email: 'foo@test.no',
          },
        ],
      },
      indexToRemove: 0,
      expected: false,
    },
    {
      desc:
        'Should return false when removing and the one left NOT has send notification',
      integration: {
        contacts: [
          {
            name: 'foo',
            email: 'foo@test.no',
          },
          {
            name: 'test',
            email: 'test@test.no',
            sendNotification: true,
          },
        ],
      },
      indexToRemove: 1,
      expected: false,
    },
    {
      desc:
        'Should return false when removing none of the remaining contacts have notification',
      integration: {
        contacts: [
          {
            name: 'test',
            email: 'test@test.no',
            sendNotification: true,
          },
          {
            name: 'foo',
            email: 'foo@test.no',
          },
          {
            name: 'foo',
            email: 'foo@test.no',
          },
        ],
      },
      indexToRemove: 0,
      expected: false,
    },
  ];
  cases.forEach(({ desc, integration, indexToRemove, expected }) => {
    test(`${desc}`, () => {
      expect(isValidContactListAfterRemove(integration, indexToRemove)).toEqual(
        expected
      );
    });
  });
});
