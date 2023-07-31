import omit from 'lodash/omit';

import { InspectResult, ProcessedAcls, AclName } from './types';

/*
 * Get only the acls for the current project
 */
export const processInspectTokenResults = (
  result: InspectResult,
  project?: string
): ProcessedAcls => {
  return result.capabilities.reduce((result, item) => {
    if (item.scope?.all) {
      // item looks like this: {scope: x, acl-1: y}
      // where acl-1 can be any acl key name
      const keysLeft = Object.keys(omit(item, 'scope'));
      const aclName = keysLeft[0] as AclName;
      // @ts-expect-error type compat with SDK is a bit bad here
      const value = item[aclName];

      if (result[aclName]) {
        return {
          ...result,
          [aclName]: {
            ...result[aclName],
            actions: result[aclName]?.actions.concat(value.actions),
          },
        };
      }

      return {
        ...result,
        [aclName]: value,
      };
    }

    // ignore project scope if we don't have a project
    if (item.projectScope && project) {
      if (item.projectScope.projects.includes(project)) {
        const keysLeft = Object.keys(omit(item, 'projectScope'));
        const aclName = keysLeft[0] as AclName;
        // @ts-expect-error type compat with SDK is a bit bad here
        const value = item[aclName];
        if (result[aclName]) {
          return {
            ...result,
            [aclName]: {
              ...result[aclName],
              actions: result[aclName]?.actions.concat(value.actions),
            },
          };
        }

        return {
          ...result,
          [aclName]: value,
        };
      }
    }

    return result;
  }, {} as ProcessedAcls);
};
