import { useParams } from 'react-router-dom';

import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { getProject } from '@cognite/cdf-utilities';

import { AclName, CapabilityActions, useCapabilities } from './useCapabilities';

export enum AccessAction {
  READ_DATA_VALIDATION = 'canReadDataValidation',
  WRITE_DATA_VALIDATION = 'canWriteDataValidation',
  TRIGGER_VALIDATION = 'canTriggerValidation',
  DOWNLOAD_REPORT = 'canDownloadReport',
}

export const useAccessControl = () => {
  const project = getProject();
  const { space } = useParams() as {
    space: string;
  };

  const { capabilities, isLoading } = useCapabilities([project], {
    spaceIds: [space],
  });

  const accesses = resolveAccess(capabilities);

  return {
    ...accesses,
    isLoading,
    useErrorMessage,
  };
};

/** Defines what capability and actions each Data Validation operation requires. */
const accessMatrix: Record<AccessAction, Partial<CapabilityActions>> = {
  canReadDataValidation: {
    dataModelsAcl: ['READ'],
    datasetsAcl: ['READ'],
    timeSeriesAcl: ['READ'],
  },
  canWriteDataValidation: {
    dataModelsAcl: ['READ', 'WRITE'],
    datasetsAcl: ['READ'],
    timeSeriesAcl: ['WRITE'],
  },
  canTriggerValidation: {
    dataModelInstancesAcl: ['READ'],
    dataModelsAcl: ['READ', 'WRITE'],
    datasetsAcl: ['READ'],
    filesAcl: ['WRITE'],
    sessionsAcl: ['CREATE'],
    timeSeriesAcl: ['WRITE'],
  },
  canDownloadReport: {
    dataModelInstancesAcl: ['READ'],
    dataModelsAcl: ['READ'],
    datasetsAcl: ['READ'],
    filesAcl: ['READ'],
  },
};

/**
 * For each action defined in access matrix, every required actions of every required capability
 * should exist in user's available capabilities.
 */
const resolveAccess = (capabilities?: CapabilityActions) => {
  return Object.entries(accessMatrix).reduce(
    (accesses, [accessAction, requiredCapabilities]) => {
      const hasMatchingAccess = Object.entries(requiredCapabilities).every(
        ([aclName, actions]) => {
          const acl = aclName as AclName;

          if (!capabilities?.[acl]) return false;

          return actions.every((action) => capabilities[acl].includes(action));
        }
      );

      accesses[accessAction as AccessAction] = hasMatchingAccess;
      return accesses;
    },
    {} as Record<AccessAction, boolean>
  );
};

/** Get the error message specific to an permission/action type. */
const useErrorMessage = (action: AccessAction) => {
  const { t } = useTranslation('useErrorMessage');

  const requiredCapabilities = Object.entries(accessMatrix[action]).reduce(
    (text, [capability, actions]) =>
      text + `\n${capability}: [${actions.join(', ')}],`,
    ''
  );

  switch (action) {
    case AccessAction.READ_DATA_VALIDATION:
      return t(
        'data_quality_access_error_read',
        `To view Data Validation, the following capabilities are required:${requiredCapabilities}`
      );
    case AccessAction.WRITE_DATA_VALIDATION:
      return t(
        'data_quality_access_error_write',
        `To create Data Validation entities, the following capabilities are required:${requiredCapabilities}`
      );
    case AccessAction.TRIGGER_VALIDATION:
      return t(
        'data_quality_access_error_trigger',
        `To start a Data Validation job, the following capabilities are required:${requiredCapabilities}`
      );
    case AccessAction.DOWNLOAD_REPORT:
      return t(
        'data_quality_access_error_download',
        `To download a Data Validation report, the following capabilities are required:${requiredCapabilities}`
      );
    default:
      return t(
        'data_quality_access_error',
        'Something went wrong. Access capabilities may be missing.'
      );
  }
};
