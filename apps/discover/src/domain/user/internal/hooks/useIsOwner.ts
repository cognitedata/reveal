import { useUserInfoQuery } from 'domain/userManagementService/internal/queries/useUserInfoQuery';

export function useIsOwner() {
  const { data, isFetched } = useUserInfoQuery();

  const isOwner = (userId: string): boolean => {
    if (!data) {
      return false;
    }

    return data.id === userId;
  };

  return { isOwner, isFetched };
}
