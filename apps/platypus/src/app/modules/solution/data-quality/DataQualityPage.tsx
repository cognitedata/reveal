import { Body, Button, Chip, ChipProps, Flex, Tooltip } from '@cognite/cogs.js';

import { BasicPlaceholder } from '../../../components/BasicPlaceholder/BasicPlaceholder';
import { PageContentLayout } from '../../../components/Layouts/PageContentLayout';
import { PageToolbar } from '../../../components/PageToolbar/PageToolbar';
import { Spinner } from '../../../components/Spinner/Spinner';
import { useTranslation } from '../../../hooks/useTranslation';

import { RuleRunStatus } from './api/codegen';
import {
  AccessAction,
  useAccessControl,
  useDataSourceValidation,
  useLoadDataSource,
  useValidationStatusMessage,
  ValidationStatus,
} from './hooks';
import { DataQualityOverview, DownloadReport } from './pages';

export const DataQualityPage = () => {
  const { t } = useTranslation('DataQualityPage');

  const {
    dataSource,
    error,
    isLoading: isLoadingDataSource,
  } = useLoadDataSource();
  const {
    disabledMessage: validationDisabledMessage,
    isDisabled: isValidationDisabled,
    startValidation,
    status: validationStatus,
  } = useDataSourceValidation();
  const {
    isLoading: isLoadingAccess,
    canReadDataValidation,
    canWriteDataValidation,
    useErrorMessage,
  } = useAccessControl();

  const accessErrorMessageRead = useErrorMessage(
    AccessAction.READ_DATA_VALIDATION
  );
  const accessErrorMessageWrite = useErrorMessage(
    AccessAction.WRITE_DATA_VALIDATION
  );

  const renderContent = () => {
    if (isLoadingDataSource || isLoadingAccess) {
      return <Spinner />;
    }

    if (error) {
      return (
        <BasicPlaceholder
          type="EmptyStateFolderSad"
          title={t('data_quality_not_found_ds', '')}
        >
          <Body size="small">{JSON.stringify(error?.stack?.error)}</Body>
        </BasicPlaceholder>
      );
    }

    if (!canReadDataValidation) {
      return (
        <BasicPlaceholder
          type="SecureSecurity"
          title={t('data_quality_no_access_read', '')}
        >
          <Body size="small">{accessErrorMessageRead}</Body>
        </BasicPlaceholder>
      );
    }

    if (!dataSource && !canWriteDataValidation) {
      return (
        <BasicPlaceholder
          type="SecureSecurity"
          title={t('data_quality_no_access_initiate_data_source', '')}
        >
          <Body size="small">{accessErrorMessageWrite}</Body>
        </BasicPlaceholder>
      );
    }

    return <DataQualityOverview />;
  };

  return (
    <PageContentLayout>
      <PageContentLayout.Header data-cy="dq-page-header">
        <PageToolbar
          behindTitle={<ValidationStatusLabel status={validationStatus} />}
          title={t('data_quality_title', '')}
        >
          {dataSource && canReadDataValidation && (
            <Flex direction="row" gap={8}>
              <Tooltip
                content={validationDisabledMessage}
                disabled={!isValidationDisabled}
                wrapped
              >
                <Button
                  disabled={isValidationDisabled}
                  loading={validationStatus === 'InProgress'}
                  onClick={startValidation}
                  type="primary"
                >
                  {t('data_quality_validate_now', '')}
                </Button>
              </Tooltip>

              <DownloadReport validationStatus={validationStatus} />
            </Flex>
          )}
        </PageToolbar>
      </PageContentLayout.Header>

      <PageContentLayout.Body data-cy="dq-page-content">
        {renderContent()}
      </PageContentLayout.Body>
    </PageContentLayout>
  );
};

type ValidationStatusLabelProps = {
  status: ValidationStatus;
};

// TODO: Move to /components folder after restructuring page structure
const ValidationStatusLabel = ({ status }: ValidationStatusLabelProps) => {
  const { label, message } = useValidationStatusMessage(status);

  if (status === 'Idle') return null;

  const chipStatuses: Record<RuleRunStatus, ChipProps> = {
    Error: { icon: 'ErrorFilled', type: 'danger' },
    InProgress: { icon: 'Loader', type: 'neutral' },
    Success: { icon: 'CheckmarkFilled', type: 'success' },
  };

  return (
    <Chip
      label={label}
      tooltipProps={{ content: message }}
      {...chipStatuses[status]}
    />
  );
};
