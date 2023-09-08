import { useQuery } from '@tanstack/react-query';

import { getUserInformation } from '@cognite/cdf-sdk-singleton';

export function useUserInformation() {
  return useQuery(['user-info'], getUserInformation);
}
