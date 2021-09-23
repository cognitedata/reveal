import { UMSUser } from '@cognite/user-management-service-types';

export const getMockUser = (extras: Partial<UMSUser> = {}): UMSUser => {
  return {
    id: '1',
    displayName: 'test name',
    createdTime: '',
    lastUpdatedTime: '',
    preferences: {
      hidden: false,
    },
    projects: [],
    ...extras,
  };
};
