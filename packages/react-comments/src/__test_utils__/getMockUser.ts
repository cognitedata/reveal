import {
  UMSUser,
  UMSUserProfile,
} from '@cognite/user-management-service-types';

export const getMockUser = (extras: Partial<UMSUser> = {}): UMSUserProfile => {
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
