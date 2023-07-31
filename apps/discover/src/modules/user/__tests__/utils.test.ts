import { getUser } from '__test-utils/fixtures/user';

import { getFullUserName, getFullNameOrDefaultText } from '../utils';

describe('getFullUserName', () => {
  test('main case', () => {
    expect(
      getFullUserName(getUser({ firstname: 'Test', lastname: 'User' }))
    ).toEqual('Test User');
  });

  test('no name', () => {
    expect(getFullUserName(getUser())).toContain('-discover@cognite.com');
  });
});

describe('getFullNameOrDefaultText', () => {
  test('no data', () => {
    const userData = undefined;

    expect(getFullNameOrDefaultText(userData)).toEqual('');
  });

  test('main case', () => {
    const userData = getUser({ firstname: 'Test', lastname: 'User' });

    expect(getFullNameOrDefaultText(userData)).toEqual('Test User');
  });

  test('no last name', () => {
    const userData = getUser({ firstname: 'Test' });

    expect(getFullNameOrDefaultText(userData)).toEqual('Test');
  });

  test('no first name', () => {
    const userData = getUser({ lastname: 'User' });

    expect(getFullNameOrDefaultText(userData)).toEqual('User');
  });

  test('no first or last name', () => {
    const userData = getUser();

    expect(getFullNameOrDefaultText(userData)).toContain(
      '-discover@cognite.com'
    );
  });

  test('no displayable data', () => {
    const userData = {};

    expect(getFullNameOrDefaultText(userData)).toEqual('Unknown');
  });
});
