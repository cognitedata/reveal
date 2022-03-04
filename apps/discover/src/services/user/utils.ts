import { useUserProfileQuery } from 'services/user/useUserQuery';

export function useIsOwner() {
  const { data, isFetched } = useUserProfileQuery();

  const isOwner = (userId: string): boolean => {
    if (!data) {
      return false;
    }

    return data.id === userId;
  };

  return { isOwner, isFetched };
}
