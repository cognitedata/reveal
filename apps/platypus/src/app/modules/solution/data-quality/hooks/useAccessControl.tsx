import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { IDPType } from '@cognite/login-utils';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

export enum ActionType {
  READ_DATA_VALIDATION,
  WRITE_DATA_VALIDATION,
  TRIGGER_VALIDATION,
  DOWNLOAD_REPORT,
}
export const useAccessControl = () => {
  const { flow } = getFlow();
  const flowIDTP = flow as IDPType;

  // Get Files capabilities
  const { data: hasFilesReadCapability, isLoading: isLoadingFilesRead } =
    usePermissions(flowIDTP, 'filesAcl', 'READ');
  const { data: hasFilesWriteCapability, isLoading: isLoadingFilesWrite } =
    usePermissions(flowIDTP, 'filesAcl', 'WRITE');

  // Get Timeseries capabilities
  const {
    data: hasTimeseriesReadCapability,
    isLoading: isLoadingTimeseriesRead,
  } = usePermissions(flowIDTP, 'timeSeriesAcl', 'READ');
  const {
    data: hasTimeseriesWriteCapability,
    isLoading: isLoadingTimeseriesWrite,
  } = usePermissions(flowIDTP, 'timeSeriesAcl', 'WRITE');

  // Get Sessions capabilities
  const {
    data: hasSessionsWriteCapability,
    isLoading: isLoadingSessionsWrite,
  } = usePermissions(flowIDTP, 'sessionsAcl', 'CREATE');

  // Get Datasets capabilities
  const { data: hasDataSetsReadCapability, isLoading: isLoadingDataSetsRead } =
    usePermissions(flowIDTP, 'datasetsAcl', 'READ');

  // Get Datamodels capabilities
  const {
    data: hasDataModelsReadCapability,
    isLoading: isLoadingDataModelsRead,
  } = usePermissions(flowIDTP, 'dataModelsAcl', 'READ');
  const {
    data: hasDataModelsWriteCapability,
    isLoading: isLoadingDataModelsWrite,
  } = usePermissions(flowIDTP, 'dataModelsAcl', 'WRITE');
  const {
    data: hasDataModelInstancesReadCapability,
    isLoading: isLoadingDataModelInstancesRead,
  } = usePermissions(flowIDTP, 'dataModelInstancesAcl', 'READ');

  const isLoadingFilesAcl = isLoadingFilesRead || isLoadingFilesWrite;
  const isLoadingTimeseriesAcl =
    isLoadingTimeseriesRead || isLoadingTimeseriesWrite;
  const isLoadingDataModelsAcl =
    isLoadingDataModelsRead ||
    isLoadingDataModelsWrite ||
    isLoadingDataModelInstancesRead;

  const isLoading =
    isLoadingFilesAcl ||
    isLoadingTimeseriesAcl ||
    isLoadingDataModelsAcl ||
    isLoadingSessionsWrite ||
    isLoadingDataSetsRead;

  // Can read already exisiting components (data source, rules) in Data Validation
  const canReadDataValidation =
    hasDataModelsReadCapability &&
    hasTimeseriesReadCapability &&
    hasDataSetsReadCapability;

  // Can create components (data source, rules) in Data Validation
  const canWriteDataValidation =
    canReadDataValidation &&
    hasDataModelsWriteCapability &&
    hasTimeseriesWriteCapability;

  const canTriggerValidation =
    canWriteDataValidation &&
    hasFilesWriteCapability &&
    hasDataModelInstancesReadCapability &&
    hasSessionsWriteCapability;

  const canDownloadReport =
    canReadDataValidation &&
    hasDataModelInstancesReadCapability &&
    hasFilesReadCapability;

  return {
    canReadDataValidation,
    canWriteDataValidation,
    canTriggerValidation,
    canDownloadReport,
    isLoading,
    useErrorMessage,
  };
};

/** Get the error message specific to an permission/action type. */
const useErrorMessage = (action: ActionType) => {
  const { t } = useTranslation('useErrorMessage');

  switch (action) {
    case ActionType.READ_DATA_VALIDATION:
      return t(
        'data_quality_access_error_read',
        'To view Data Validation, the following capabilities are required:\ndatasetsAcl: [READ],\ndataModelsAcl: [READ],\ntimeSeriesAcl: [READ]'
      );
    case ActionType.WRITE_DATA_VALIDATION:
      return t(
        'data_quality_access_error_write',
        'To use Data Validation, the following capabilities are required:\ndatasetsAcl: [READ],\ndataModelsAcl: [READ],\ntimeSeriesAcl: [READ, WRITE]'
      );
    case ActionType.TRIGGER_VALIDATION:
      return t(
        'data_quality_access_error_trigger',
        'To start a Data Validation job, the following capabilities are required:\ndatasetsAcl: [READ],\ndataModelsAcl: [READ],\ndataModelInstancesAcl: [READ],\nfilesAcl: [WRITE],\nsessionsAcl: [CREATE],\ntimeSeriesAcl: [READ, WRITE]'
      );
    case ActionType.DOWNLOAD_REPORT:
      return t(
        'data_quality_access_error_download',
        'To download a Data Validation report, the following capabilities are required:\ndatasetsAcl: [READ],\ndataModelsAcl: [READ],\ndataModelInstancesAcl: [READ],\nfilesAcl: [READ],\ntimeSeriesAcl: [READ]'
      );
    default:
      return t(
        'data_quality_access_error',
        'Something went wrong. Access capabilities may be missing.'
      );
  }
};
