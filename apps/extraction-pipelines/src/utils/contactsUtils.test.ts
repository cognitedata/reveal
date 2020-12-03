import { createUpdateObj, filterAuthors, mapContacts } from './contactsUtils';
import { ContactsTableCol } from '../components/table/details/ContactTableCols';
import { getMockResponse } from './mockResponse';

describe('contactsUtils', () => {
  const contacts: ContactsTableCol[] = [
    { accessor: 'owner', name: 'owner', email: 'owner@test.no' },
    { accessor: 'authors', name: 'Test', email: 'test@test.no' },
    { accessor: 'authors', name: 'foo', email: 'foor@test.no' },
    { accessor: 'authors', name: 'bar', email: 'bar@test.no' },
  ];
  test('filterAuthors', () => {
    const rowIndex = 2;
    const res = filterAuthors(contacts, rowIndex);
    expect(res.length).toEqual(2);
    expect(res[0].name).toEqual(contacts[1].name);
    expect(res[1].name).toEqual(contacts[3].name);
  });

  test('createUpdateObj - authors', () => {
    const details = contacts[2];
    const id = 32;
    const res = createUpdateObj(details, contacts, id);
    expect(res[0].id).toEqual(`${id}`);
    expect(res[0].update.authors).toBeDefined();
    expect(res[0].update.authors.set.length).toEqual(3);
  });

  test('createUpdateObj - creates owner', () => {
    const details = contacts[0];
    const id = 32;
    const res = createUpdateObj(details, contacts, id);
    expect(res[0].id).toEqual(`${id}`);
    expect(res[0].update.owner).toBeDefined();
    expect(res[0].update.owner.set.name).toEqual(contacts[0].name);
  });

  test('mapContacts - maps owner and authors to table columns', () => {
    const integration = getMockResponse()[0];
    const nrOfAuthors = integration.authors.length;
    const res = mapContacts(integration);
    const nrOfOwner = 1;
    expect(res.length).toEqual(nrOfAuthors + nrOfOwner);
    res.forEach((r) => {
      expect(r.isNewContact).toEqual(false);
      expect(r.isEditable).toEqual(true);
    });
    expect(res[0].accessor).toEqual('owner');
    expect(res[0].isDeletable).toEqual(false);
    const authorCols = res.slice(1);
    authorCols.forEach((c) => {
      expect(c.accessor).toEqual('authors');
      expect(c.isDeletable).toEqual(true);
    });
  });
});
