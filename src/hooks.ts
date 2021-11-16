import { useSDK } from '@cognite/sdk-provider';
import { useCapabilities } from '@cognite/sdk-react-query-hooks';
import equal from 'deep-equal';
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

export const useAuthConfiguration = () => {
  const sdk = useSDK();
  return useQuery('auth-configuration', () => {
    return sdk
      .get<{
        isLegacyLoginFlowAndApiKeysEnabled: boolean;
        isOidcEnabled: boolean;
      }>(`/api/playground/projects/${sdk.project}/configuration`)
      .then(r => r.data);
  });
};

export const usePermissions = (key: string, type?: string, scope?: any) => {
  const permissionScope = scope || { all: {} };

  const capabilities = useCapabilities();
  const acls = capabilities.data?.filter(
    c => c.acl === key && equal(c.scope, permissionScope)
  );
  return {
    ...capabilities,
    data:
      acls &&
      (type
        ? acls.some(({ actions }) =>
            actions.find(a => a.toLowerCase() === type.toLowerCase())
          )
        : true),
  };
};
