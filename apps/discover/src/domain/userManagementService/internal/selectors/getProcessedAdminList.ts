import { UMSUser } from '@cognite/user-management-service-types';

// move current user to top of the admin user list
export const getProcessedAdminList = (
  adminList?: UMSUser[],
  currentUserId?: string
) => {
  if (!adminList) {
    return [];
  }
  return adminList.reduce((userList: UMSUser[], user) => {
    if (user.id === currentUserId) {
      return [user, ...userList];
    }
    return [...userList, user];
  }, []);
};
