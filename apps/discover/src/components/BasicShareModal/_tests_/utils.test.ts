import { SharedUser } from '../types';
import { getFormattedUsers } from '../utils';

describe('getFormattedUsers', () => {
  test('Should return formatted users for shared users list', () => {
    const users: SharedUser[] = [
      {
        id: '1',
        firstname: 'Test',
        lastname: 'User',
        email: 'test.user@cognite.com',
      },
    ];
    expect(getFormattedUsers(users)).toEqual([
      {
        email: 'test.user@cognite.com',
        fullName: 'Test User',
        iconCode: 'TU',
        id: '1',
      },
    ]);
  });
});
