import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';

export const useLoginStatus = () => {
  const sdk = useSDK();
  return useQuery(['login', 'status'], () => sdk.login.status());
};
