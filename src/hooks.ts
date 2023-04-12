import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { notification } from 'antd';
import { getFlow, getToken } from '@cognite/cdf-sdk-singleton';
import { getEnv, getProject } from '@cognite/cdf-utilities';
import { useSDK } from '@cognite/sdk-provider';
import { CogniteClient, Group } from '@cognite/sdk';
import { usePermissions as _usePermissions } from '@cognite/sdk-react-query-hooks';
import { useTranslation } from 'common/i18n';

import { LEGACY_SESSION_TOKEN_KEY } from 'utils/constants';
import { sleep } from 'utils/utils';

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
  return useQuery(['auth-configuration'], () => {
    return sdk
      .get<{
        isLegacyLoginFlowAndApiKeysEnabled: boolean;
        isOidcEnabled: boolean;
      }>(`/api/playground/projects/${sdk.project}/configuration`)
      .then((r) => r.data);
  });
};

export const usePermissions = (key: string, type?: string, scope?: any) => {
  const { flow } = getFlow();
  return _usePermissions(flow, key, type, scope);
};

const getUpdater =
  (sdk: CogniteClient, project: string) => async (g: Group) => {
    const projectData = await sdk.projects.retrieve(project);
    // @ts-ignore sdk type not up to date wrt metadata
    const { name, sourceId, capabilities, id, metadata } = g;
    const defaultGroup = projectData?.defaultGroupId === id;
    let groupAccountIds: number[];
    try {
      groupAccountIds = (
        id ? await sdk.groups.listServiceAccounts(id) : []
      ).map((account) => account.id);
    } catch {
      groupAccountIds = [];
    }

    const [newGroup] = await sdk.groups.create([
      // @ts-ignore sdk type not up to date wrt metadata
      { name, sourceId, capabilities, metadata },
    ]);

    if (groupAccountIds.length > 0) {
      await sdk.groups.addServiceAccounts(newGroup.id, groupAccountIds);
    }

    if (defaultGroup && projectData) {
      await sdk.projects.updateProject(projectData.urlName, {
        update: {
          defaultGroupId: { set: newGroup.id },
        },
      });
    }

    if (id) {
      await sdk.groups.delete([id]);
    }

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

export const useRefreshToken = () => {
  const env = getEnv() || 'api';
  const project = getProject();

  const refreshToken = async () => {
    const sessionStorageKey = `${LEGACY_SESSION_TOKEN_KEY}_${env}_${project}`;
    sessionStorage.removeItem(sessionStorageKey);
    await getToken();
  };

  return { refreshToken };
};

export const forUnitTests = {
  getUpdater,
};

export const useListServiceAccounts = (isLegacyFlow: boolean) => {
  const sdk = useSDK();
  return useQuery(['service-accounts'], () => sdk.serviceAccounts.list(), {
    enabled: isLegacyFlow,
  });
};

const deleteServiceAccount =
  (sdk: CogniteClient, project: string) => async (accountIds: number[]) => {
    await sdk.post(`/api/v1/projects/${project}/serviceaccounts/delete`, {
      data: {
        items: accountIds,
      },
    });
  };

export const useDeleteServiceAccounts = (project: string) => {
  const { t } = useTranslation();
  const sdk = useSDK();
  const client = useQueryClient();
  return useMutation(deleteServiceAccount(sdk, project), {
    onMutate() {
      notification.info({
        key: 'delete-legacy-service-accounts',
        message: t('legacy-service-account-delete-progress'),
      });
    },
    onSuccess() {
      notification.success({
        key: 'delete-legacy-service-accounts',
        message: t('legacy-service-account-delete-success'),
      });
      client.invalidateQueries(['service-accounts']);
    },
    onError() {
      notification.error({
        key: 'delete-legacy-service-accounts',
        message: t('legacy-service-account-delete-fail'),
        description: t('legacy-service-account-delete-error'),
      });
    },
  });
};
