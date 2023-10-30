import { sleep } from '@access-management/utils/utils';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
} from '@tanstack/react-query';

import { getFlow, getUserInformation } from '@cognite/cdf-sdk-singleton';
import {
  CogniteCapability,
  CogniteClient,
  Group,
  SingleCogniteCapability,
} from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { usePermissions as _usePermissions } from '@cognite/sdk-react-query-hooks';

export const useGroups = (all = false) => {
  const sdk = useSDK();
  return useQuery<Group[]>(['groups', { all }], async () => {
    const list = await sdk.groups.list({ all: true });
    return list
      .map((g) => {
        let editable = true;
        /**
         * g.capabilities is of type CogniteCapability | undefined
         * But sometimes, if the group is created with project hierarchy properties,
         * it will have some extra properties in every capability object.
         * Here, I'm removing those objects, and instead adding an editable property to the group
         * But typescript can't detect that I'm removing properties that won't already match the type
         * and is complaining; hence the ts-ignore and the type casting.
         *
         * When the types and the code is updated the support project hierarchy, both this ts-ignore
         * and the code piece itself should be removed.
         */
        const capabilities: CogniteCapability | undefined = g.capabilities?.map(
          (c) => {
            const capabilityKeys = Object.keys(c);
            if (capabilityKeys.length > 1) {
              editable = false;
              const acl = capabilityKeys.find((key) => key.endsWith('Acl'));
              return {
                // @ts-ignore I can't properly type the key, but it's not generic string for sure
                [acl]: c[acl],
              } as SingleCogniteCapability;
            }
            return c;
          }
        );
        return {
          ...g,
          capabilities,
          editable,
        };
      })
      .sort((a, b) => {
        try {
          return (a.name || '').localeCompare(b.name || '');
        } catch {
          return 0;
        }
      });
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

export const forUnitTests = {
  getUpdater,
};

export const useUserInformation = () => {
  return useQuery(['user-info'], getUserInformation);
};
