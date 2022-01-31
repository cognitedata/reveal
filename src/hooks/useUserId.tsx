import { useQuery } from 'react-query';
import { getUserInformation } from '@cognite/cdf-sdk-singleton';

export const useUserId = () => {
  const { data: userData } = useQuery(['user', 'info'], getUserInformation);

  const { mail = 'UNKNOWN' } = userData || {};
  const username =
    userData?.displayName ?? userData?.id ?? userData?.email ?? userData?.mail;

  return { mail, username };
};
