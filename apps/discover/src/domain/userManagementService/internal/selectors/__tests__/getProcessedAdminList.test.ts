import { getMockUmsUsers } from 'domain/userManagementService/service/__fixtures/getMockUmsUsers';

import head from 'lodash/head';

import { getProcessedAdminList } from '../getProcessedAdminList';

describe('getProcessedAdminList', () => {
  it('should return empty array with empty input', () => {
    expect(getProcessedAdminList()).toEqual([]);
  });

  it('should return expected output with valid input', () => {
    const result = getProcessedAdminList(getMockUmsUsers(), 'testId_2');
    expect(head(result)).toMatchObject(getMockUmsUsers()[1]);
  });
});
