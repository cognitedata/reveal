import { InspectResult, AccessCheckResult, AccessRequirements } from './types';
import { checkRequirements } from './checkRequirements';
import { processInspectTokenResults } from './processInspectTokenResults';

export const checkUserAccess = async (
  requirements: AccessRequirements,
  currentAccess: InspectResult = { capabilities: [] },
  project?: string
): Promise<AccessCheckResult> => {
  const mergedAccessList = processInspectTokenResults(currentAccess, project);

  const accessCheckResult = checkRequirements({
    requirements,
    currentAccess: mergedAccessList,
  });

  return sortResults(accessCheckResult);
};

const sortResults = (accessCheckResult: AccessCheckResult) => {
  return accessCheckResult.sort((value) => {
    if (value.missing.length > 0) {
      return -1;
    }

    return 1;
  });
};
