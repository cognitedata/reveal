import { ADMIN_GROUP_NAME } from 'constants/cdf';

import { Group } from '@cognite/sdk';

export const getGroupNames = (groups: Group[] = []): string[] =>
  groups.map((group) => group.name);

export const checkIsAdmin = (groups: Group[]): boolean =>
  getGroupNames(groups).includes(ADMIN_GROUP_NAME);
