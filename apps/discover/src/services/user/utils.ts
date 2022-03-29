import { useUserInfo } from '../userManagementService/query';

export function useIsOwner() {
  const { data, isFetched } = useUserInfo();

  const isOwner = (userId: string): boolean => {
    if (!data) {
      return false;
    }

    return data.id === userId;
  };

  return { isOwner, isFetched };
}
