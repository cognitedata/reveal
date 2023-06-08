import { useTranslation } from '@access-management/common/i18n';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { notification } from 'antd';
import { LEGACY_SESSION_TOKEN_KEY } from '@access-management/utils/constants';
import { sleep } from '@access-management/utils/utils';

import { getFlow, getToken } from '@cognite/cdf-sdk-singleton';
import { getEnv, getProject } from '@cognite/cdf-utilities';
import { CogniteClient, Group } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { usePermissions as _usePermissions } from '@cognite/sdk-react-query-hooks';

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

const getUpdater = (sdk: CogniteClient) => async (g: Group) => {
  // @ts-ignore sdk type not up to date wrt metadata
  const { name, sourceId, capabilities, id, metadata } = g;
  const [newGroup] = await sdk.groups.create([
    // @ts-ignore sdk type not up to date wrt metadata
    { name, sourceId, capabilities, metadata },
  ]);

  if (id) {
    await sdk.groups.delete([id]);
  }

  await sleep(500);
  return newGroup;
};

export const useUpdateGroup = (
  o: UseMutationOptions<Group, unknown, Group, unknown>
) => {
  const sdk = useSDK();
  return useMutation(getUpdater(sdk), o);
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
