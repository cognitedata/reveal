import { UMSUser } from '@cognite/user-management-service-types';

import { UNASSIGNED } from 'pages/authorized/admin/feedback/constants';

import { getAssigneeName } from '../getAssigneeName';

describe('getAssigneeName', () => {
  const testUser: UMSUser = {
    displayName: 'Test user',
    projects: [],
    id: 'test_id',
    createdTime: '',
    lastUpdatedTime: '',
  };
  it('should return unassigned', () => {
    expect(getAssigneeName()).toEqual(UNASSIGNED);
  });

  it('should return user name', () => {
    expect(getAssigneeName(testUser)).toEqual(testUser.displayName);
  });

  it('should return user name without company name', () => {
    expect(
      getAssigneeName({ ...testUser, displayName: 'Test user (Cognite)' })
    ).toEqual(testUser.displayName);
  });

  it('should return user name with `you` when created user id same to the user id', () => {
    expect(getAssigneeName(testUser, testUser.id)).toEqual(
      `${testUser.displayName} (you)`
    );
  });
});
