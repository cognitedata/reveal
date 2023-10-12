import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';

import { AccessPermission } from '../utils/types';

import { useGroups } from './useGroups';

export const useUserCapabilities = (acls: Array<AccessPermission>) => {
  const { data: groups = [], ...queryProps } = useGroups();

  const copy = cloneDeep(acls);
  copy.forEach((acl) => {
    groups.forEach((group) => {
      if (!group.capabilities) {
        return;
      }
      group.capabilities.forEach((cap) => {
        if (acl.acl in cap) {
          acl.actions.forEach((action, index) => {
            // @ts-ignore : no proper index type for CogniteCapabilities
            if (cap[acl.acl].actions.includes(action)) {
              // eslint-disable-next-line no-param-reassign
              acl.actions[index] = '';
            }
          });
        }
      });
    });
  });

  const data = groups.length
    ? copy.every((result) =>
        isEmpty(result.actions.filter((action) => action !== ''))
      )
    : undefined;

  return { data, ...queryProps };
};
