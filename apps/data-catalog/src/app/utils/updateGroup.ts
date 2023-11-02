import omit from 'lodash/omit';

import sdk from '@cognite/cdf-sdk-singleton';
import { Group, GroupSpec } from '@cognite/sdk';

import { TranslationKeys } from '../common/i18n';

import { retry } from './retry';
import { UpdateGroupData } from './types';

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
  update: UpdateGroupData['update'],
  _t: (key: TranslationKeys) => string
): Promise<Group> => {
  const allGroups: Group[] = await sdk.groups.list({ all: true });
  const originalGroup: Group | undefined = allGroups.find((g) => g.id === id);

  if (!originalGroup) {
    throw new Error(_t('error-group-does-not-exist'));
  }

  const tempGroup = updateGroupData(originalGroup, update) as GroupSpec;

  const [newGroup]: Group[] = await sdk.groups.create([tempGroup]);

  try {
    const deleteOriginalGroup = async () => sdk.groups.delete([id]);
    await retry(deleteOriginalGroup, null, NUMBER_OF_RETRIES);
  } catch (error) {
    const deleteNewGroup = async () => sdk.groups.delete([newGroup.id]);
    await retry(deleteNewGroup, null, NUMBER_OF_RETRIES);
    throw new Error(_t('error-cannot-edit-the-default-group'));
  }

  return newGroup;
};
