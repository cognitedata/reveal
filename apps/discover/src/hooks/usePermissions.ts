import { useCapabilitiesQuery } from 'domain/capabilities/internal/queries/useCapabilitiesQuery';

import isEmpty from 'lodash/isEmpty';
import xor from 'lodash/xor';

/**
 * Check if user has the correct permission ACLs and corresponding actions rights.
 *
 * @param permissions object of permissions and actions to validate
 * @returns undefined if user has all 'permissions', otherwise, an object with missing permission acls (and actions).
 *
 * @example usePermissions({ userAcl: ['READ']}) => undefined
 * @example usePermissions({ userAcl: ['READ', 'WRITE']}) => { userAcl: ['WRITE'] }
 */
export const usePermissions = (permissions: {
  [x in string]: ('READ' | 'WRITE' | 'CREATE' | 'UPDATE' | 'DELETE')[];
}) => {
  const { data, isLoading } = useCapabilitiesQuery();

  if (isLoading) {
    return undefined;
  }

  const result = Object.keys(permissions).reduce((acc, permission) => {
    const requestedActions = permissions[permission]; // e.g., ['READ', 'WRITE']

    const capability = data?.capabilities?.find((capability) => {
      return Boolean((capability as any)[permission]);
    });

    if (!capability) {
      return { ...acc, [permission]: requestedActions };
    }

    const capabilityActions = (capability as any)[permission].actions;

    const hasCorrectPermissionActions = requestedActions.every((item) =>
      capabilityActions.includes(item)
    );

    if (!hasCorrectPermissionActions) {
      return {
        ...acc,
        [permission]: xor(capabilityActions, requestedActions),
      };
    }

    return acc;
  }, {});

  return isEmpty(result) ? undefined : result;
};
