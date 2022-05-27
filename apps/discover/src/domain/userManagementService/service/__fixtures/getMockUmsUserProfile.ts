import { UMSUserProfile } from '@cognite/user-management-service-types';

export const getMockUmsUserProfile = (
  preferences?: Partial<UMSUserProfile>
): UMSUserProfile => ({
  id: '1',
  displayName: 'John Doe',
  projects: [],
  createdTime: '1',
  lastUpdatedTime: '1',
  preferences: {
    hidden: false,
    measurement: 'meter',
  },
  ...preferences,
});
