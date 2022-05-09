import { getMockUmsUsers } from 'services/userManagementService/__fixtures/umsUsers';

import { filterUmsUserFromId } from '../getUmsUserFromId';

describe('filterUmsUserFromId', () => {
  it('should return undefined', () => {
    expect(filterUmsUserFromId()).toBeUndefined();
  });

  it('should return undefined with empty userId', () => {
    expect(filterUmsUserFromId(getMockUmsUsers())).toBeUndefined();
  });

  it('should return expected result with valid input', () => {
    const result = filterUmsUserFromId(getMockUmsUsers(), 'testId_2');
    expect(result).toMatchObject(getMockUmsUsers()[1]);
  });
});
