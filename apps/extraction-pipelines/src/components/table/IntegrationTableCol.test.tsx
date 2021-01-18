import { createSearchStringForContacts } from './IntegrationTableCol';
import { User } from '../../model/User';

describe('IntegrationTableCol', () => {
  test('createSearchStringForContacts - should handle missing contacts', () => {
    const contacts = undefined;
    const res = createSearchStringForContacts(contacts);
    expect(res).toBeDefined();
  });

  test('createSearchStringForContacts - should handle empty contacts', () => {
    const contacts: User[] = [];
    const res = createSearchStringForContacts(contacts);
    expect(res).toEqual('');
  });
});
