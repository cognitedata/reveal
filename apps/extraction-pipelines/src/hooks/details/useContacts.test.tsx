import { act, renderHook } from '@testing-library/react-hooks';
import { useContacts } from './useContacts';
import { getMockResponse } from '../../utils/mockResponse';
import { ContactsTableCol } from '../../components/table/details/ContactTableCols';
import { User } from '../../model/User';

describe('useContacts', () => {
  test('Add 1 new, remove from existing', () => {
    const integration = getMockResponse()[0];
    const numberOfAuthors = integration.authors.length;
    const owner = 1;
    const numberOfContacts = numberOfAuthors + owner;
    const { result } = renderHook(() => useContacts(integration));
    expect(result.current.contacts.length).toEqual(numberOfContacts);

    const contact1 = createContact({
      name: 'Test Testsen',
      email: 'test@test.no',
      indexInOriginal: numberOfAuthors + 1,
      original: integration.authors,
    });
    // add 1
    act(() => {
      result.current.addContact(contact1);
    });
    expect(result.current.contacts.length).toEqual(numberOfContacts + 1);
    const theLast = getLastContact(result.current.contacts);
    expect(theLast).toEqual(contact1);

    // remove 1 from original
    act(() => {
      result.current.removeContact(numberOfAuthors - 1, 'authors');
    });
    expect(result.current.contacts.length).toEqual(numberOfContacts);
    const stillTheLast = getLastContact(result.current.contacts);
    expect(stillTheLast).toEqual(contact1);
  });

  test('Add 1 new, remove newly added', () => {
    const integration = getMockResponse()[0];
    const numberOfAuthors = integration.authors.length;
    const owner = 1;
    const numberOfContacts = numberOfAuthors + owner;
    const { result } = renderHook(() => useContacts(integration));
    expect(result.current.contacts.length).toEqual(numberOfContacts);

    const contact1 = createContact({
      name: 'Test Testsen',
      email: 'test@test.no',
      indexInOriginal: numberOfAuthors + 1,
      original: integration.authors,
    });
    // add 1
    act(() => {
      result.current.addContact(contact1);
    });
    expect(result.current.contacts.length).toEqual(numberOfContacts + 1);
    const theLast = getLastContact(result.current.contacts);
    expect(theLast).toEqual(contact1);

    // remove the newly added
    act(() => {
      result.current.removeContact(
        result.current.contacts.length - 1,
        'authors'
      );
    });
    expect(result.current.contacts.length).toEqual(numberOfContacts);
    const stillTheLast = getLastContact(result.current.contacts);
    expect(stillTheLast).not.toEqual(contact1);
  });

  test('Remove 1', () => {
    const integration = getMockResponse()[0];
    const numberOfAuthors = integration.authors.length;
    const owner = 1;
    const numberOfContacts = numberOfAuthors + owner;
    const { result } = renderHook(() => useContacts(integration));
    expect(result.current.contacts.length).toEqual(numberOfContacts);

    // remove
    act(() => {
      result.current.removeContact(1, 'authors');
    });
    expect(result.current.contacts.length).toEqual(numberOfContacts - 1);
  });

  test('Remove all authors, add 1 author', () => {
    const integration = getMockResponse()[0];
    const numberOfAuthors = integration.authors.length;
    const owner = 1;
    const numberOfContacts = numberOfAuthors + owner;
    const { result } = renderHook(() => useContacts(integration));
    expect(result.current.contacts.length).toEqual(numberOfContacts);

    // remove all authors
    act(() => {
      integration.authors.forEach((_, index) => {
        result.current.removeContact(index, 'authors');
      });
    });
    expect(result.current.contacts.length).toEqual(1);

    const contact1 = createContact({
      name: 'Test Testsen',
      email: 'test@test.no',
      indexInOriginal: numberOfAuthors + 1,
      original: integration.authors,
    });
    // add 1
    act(() => {
      result.current.addContact(contact1);
    });
    expect(result.current.contacts.length).toEqual(2);
  });
});

const getLastContact = (contacts: ContactsTableCol[]) => {
  const last = contacts.length - 1;
  return contacts[last];
};

interface CreateContact {
  name: string;
  email: string;
  indexInOriginal: number;
  original: User[];
}

const createContact = ({
  name,
  email,
  indexInOriginal,
  original,
}: CreateContact): ContactsTableCol => {
  return {
    label: '',
    accessor: 'authors',
    name,
    email,
    indexInOriginal,
    original,
    isEditable: true,
  };
};
