import { getMockUmsUsers } from 'domain/userManagementService/service/__fixtures/getMockUmsUsers';

import { getUmsUserFromId } from '../getUmsUserFromId';

describe('getUmsUserFromId', () => {
  it('should return undefined', () => {
    expect(getUmsUserFromId()).toBeUndefined();
  });

  it('should return undefined with empty userId', () => {
    expect(getUmsUserFromId(getMockUmsUsers())).toBeUndefined();
  });

  it('should return expected result with valid input', () => {
    const result = getUmsUserFromId(getMockUmsUsers(), 'testId_2');
    expect(result).toMatchObject(getMockUmsUsers()[1]);
  });
});
