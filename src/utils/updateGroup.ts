import { Group, ServiceAccount, GroupSpec } from '@cognite/sdk';
import omit from 'lodash/omit';
import sdk from '@cognite/cdf-sdk-singleton';
import { isOidcEnv } from 'utils/utils';
import { UpdateGroupData } from './types';
import { retry } from './retry';

const NUMBER_OF_RETRIES = 6;

// helper function to remove 'version' key from acls, since create endpoint doesn't want it
const removeVersionAttrFromAcls = (
  partialGroup: Group | UpdateGroupData['update']
) => {
  const cleanPartialGroup = omit(partialGroup, [
    'id',
    'isDeleted',
    'deletedTime',
  ]);
  return {
    ...cleanPartialGroup,
    capabilities: partialGroup.capabilities.map((acl: any) => ({
      ...Object.keys(acl).reduce(
        (acc, cur) => ({
          ...acc,
          // @ts-ignore cur has to be an acl key, which is what we're iterating over
          [cur]: omit(acl[cur], 'version'),
        }),
        {}
      ),
    })),
  };
};

const updateGroupData = (
  originalGroup: Group,
  update: UpdateGroupData['update']
) => {
  const cleanOriginalGroup = removeVersionAttrFromAcls(originalGroup);
  const cleanUpdate = removeVersionAttrFromAcls(update);
  return {
    ...cleanOriginalGroup,
    ...cleanUpdate,
  };
};

export const updateGroup = async (
  id: UpdateGroupData['id'],
  update: UpdateGroupData['update']
): Promise<Group> => {
  const allGroups: Group[] = await sdk.groups.list({ all: true });
  const originalGroup: Group | undefined = allGroups.find((g) => g.id === id);

  if (!originalGroup) {
    throw new Error('Group does not exist');
  }

  const tempGroup = updateGroupData(originalGroup, update) as GroupSpec;

  const [newGroup]: Group[] = await sdk.groups.create([tempGroup]);

  // Service accounts only exist in non-oidc projects
  if (!isOidcEnv()) {
    const serviceAccounts: ServiceAccount[] =
      await sdk.groups.listServiceAccounts(id);

    if (serviceAccounts.length) {
      const addServiceAccounts = async () =>
        sdk.groups.addServiceAccounts(
          newGroup.id,
          serviceAccounts.map((sa) => sa.id)
        );
      await retry(addServiceAccounts, null, NUMBER_OF_RETRIES);
    }
  }
  try {
    const deleteOriginalGroup = async () => sdk.groups.delete([id]);
    await retry(deleteOriginalGroup, null, NUMBER_OF_RETRIES);
  } catch (error) {
    const deleteNewGroup = async () => sdk.groups.delete([newGroup.id]);
    await retry(deleteNewGroup, null, NUMBER_OF_RETRIES);
    throw new Error('Cannot edit the default group');
  }

  return newGroup;
};
