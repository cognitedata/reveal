import { UMSUserProfile } from '@cognite/user-management-service-types';

export const getMockUmsUserProfilePreference = (
  preferences?: Partial<UMSUserProfile['preferences']>
): UMSUserProfile => ({
  id: '1',
  displayName: 'John Doe',
  projects: [],
  createdTime: '1',
  lastUpdatedTime: '1',
  preferences: {
    hidden: false,
    measurement: 'meter',
    ...preferences,
  },
});
