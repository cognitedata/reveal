import {
  createListOfContacts,
  createSearchStringForContacts,
} from './IntegrationTableCol';
import { User } from '../../model/User';

describe('IntegrationTableCol', () => {
  test('createListOfContacts - should handle missing authors', () => {
    const authors = undefined;
    const owner = {} as User;
    const res = createListOfContacts(owner, authors);
    expect(res.length).toEqual(1);
  });

  test('createSearchStringForContacts - should handle missing authors', () => {
    const authors = undefined;
    const owner = {} as User;
    const res = createSearchStringForContacts(owner, authors);
    expect(res).toBeDefined();
  });
});
