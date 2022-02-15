import { useUserProfileQuery } from 'services/user/useUserQuery';

export function useIsOwner() {
  const { data } = useUserProfileQuery();

  const isOwner = (userId: string): boolean => {
    if (!data) {
      return false;
    }

    return data.id === userId;
  };

  return { isOwner };
}
