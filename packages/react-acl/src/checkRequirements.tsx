import difference from 'lodash/difference';

import {
  AccessCheckResult,
  ProcessedAcls,
  AccessRequirement,
  AccessRequirements,
  AccessCheckResultItem,
} from './types';

export const checkRequirements = ({
  requirements,
  currentAccess,
}: {
  requirements: AccessRequirements;
  currentAccess: ProcessedAcls;
}): AccessCheckResult => {
  return requirements.map((requirement) => {
    return checkRequirement({ requirement, currentAccess });
  });
};

export const checkRequirement = ({
  requirement,
  currentAccess,
}: {
  requirement: AccessRequirement;
  currentAccess: ProcessedAcls;
}): AccessCheckResultItem => {
  const foundAcl = currentAccess[requirement.aclName];
  const result: AccessCheckResultItem = {
    name: requirement.context,
    error: '',
    missing: [],
  };
  if (foundAcl && foundAcl.actions) {
    const currentScope = foundAcl.actions;
    const requiredScope = requirement.acl;

    const missingAcls = difference(requiredScope, currentScope);

    if (missingAcls.length > 0) {
      return {
        ...result,
        missing: missingAcls,
      };
    }
  } else {
    return {
      ...result,
      missing: requirement.acl,
      //  error: `${context} not found`,
      // note: this file is tsx, because we want to extend here
      // to return some better messages in some cases
    };
  }

  return result;
};
