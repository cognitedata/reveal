import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';

export const useGroups = (all = false) => {
  const sdk = useSDK();
  return useQuery(['groups', { all }], async () => {
    const list = await sdk.groups.list({ all: true });
    return list.sort((a, b) => {
      try {
        return (a.name || '').localeCompare(b.name || '');
      } catch {
        return 0;
      }
    });
  });
};

export const useAuthSettings = () => {
  const sdk = useSDK();
  return useQuery('auth-settings', () => {
    return sdk
      .get<{
        isLegacyLoginFlowAndApiKeysEnabled: boolean;
        isOidcEnabled: boolean;
      }>(`/api/playground/projects/${sdk.project}/configuration`)
      .then(r => r.data);
  });
};
