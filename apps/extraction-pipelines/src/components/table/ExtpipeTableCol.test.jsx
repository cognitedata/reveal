import { createSearchStringForContacts } from './ExtpipeTableCol';

describe('ExtpipeTableCol', () => {
  test('createSearchStringForContacts - should handle missing contacts', () => {
    const contacts = undefined;
    const res = createSearchStringForContacts(contacts);
    expect(res).toBeDefined();
  });

  test('createSearchStringForContacts - should handle empty contacts', () => {
    const contacts = [];
    const res = createSearchStringForContacts(contacts);
    expect(res).toEqual('');
  });
});
