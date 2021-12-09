import { useSDK } from '@cognite/sdk-provider';
import { useCapabilities } from '@cognite/sdk-react-query-hooks';
import { CogniteClient, Group } from '@cognite/sdk';
import equal from 'deep-equal';
import { useMutation, UseMutationOptions, useQuery } from 'react-query';
import { sleep } from './utils/utils';

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

const getUpdater =
  (sdk: CogniteClient, project: string) => async (g: Group) => {
    const projectData = await sdk.projects.retrieve(project);
    // @ts-ignore sdk type not up to date wrt source
    const { name, sourceId, source, capabilities, id } = g;
    const defaultGroup = projectData?.defaultGroupId === id;
    let groupAccountIds: number[];
    try {
      groupAccountIds = (
        id ? await sdk.groups.listServiceAccounts(id) : []
      ).map(account => account.id);
    } catch {
      groupAccountIds = [];
    }

    const [newGroup] = await sdk.groups.create([
      // @ts-ignore
      { name, sourceId, source, capabilities },
    ]);

    if (groupAccountIds.length > 0) {
      await sdk.groups.addServiceAccounts(newGroup.id, groupAccountIds);
    }

    if (defaultGroup && projectData) {
      await sdk.projects.updateProject(projectData.name, {
        update: {
          defaultGroupId: { set: newGroup.id },
        },
      });
    }

    if (id) {
      await sdk.groups.delete([id]);
    }
    // eslint-disable-next-line
    // todo: service acconts
    await sleep(500);
    return newGroup;
  };

export const useUpdateGroup = (
  project: string,
  o: UseMutationOptions<Group, unknown, Group, unknown>
) => {
  const sdk = useSDK();
  return useMutation(getUpdater(sdk, project), o);
};

export const forUnitTests = {
  getUpdater,
};
