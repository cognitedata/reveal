import isEmpty from 'lodash/isEmpty';
import { AuthenticatedUserWithGroups } from '@cognite/cdf-utilities/dist/types';
import { AccessPermission } from 'src/utils/types';
import { getProject } from '@cognite/cdf-utilities';
import { ids } from 'src/cogs-variables';

export const projectName = getProject();

// Use this getContainer for all antd components such as: dropdown, tooltip, popover, modals etc
export const getContainer = () => {
  const els = document.getElementsByClassName(ids.styleScope);
  const el = els.item(0)! as HTMLElement;
  return el;
};

// e.g. acls: [ { acl: 'assetsAcl', actions: ['READ', 'EXECUTE'] } ]
export const userHasCapabilities = (
  user: AuthenticatedUserWithGroups,
  acls: Array<AccessPermission>
) => {
  const copy = [...acls];
  copy.forEach((acl) => {
    user.groups.forEach((group) => {
      if (!group.capabilities) {
        return;
      }
      group.capabilities.forEach((cap) => {
        if (acl.acl in cap) {
          acl.actions.forEach((action, index) => {
            if (cap[acl.acl].actions.includes(action)) {
              // eslint-disable-next-line no-param-reassign
              acl.actions[index] = '';
            }
          });
        }
      });
    });
  });

  return copy.every((result) =>
    isEmpty(result.actions.filter((action) => action !== ''))
  );
};
