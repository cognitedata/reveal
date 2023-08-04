import { useDisclosure } from '@data-exploration-components/hooks';
import {
  ActionType,
  useAccessControl,
  useLoadDataSource,
  useStartValidation,
} from '@data-quality/hooks';
import { BasicPlaceholder } from '@platypus-app/components/BasicPlaceholder/BasicPlaceholder';
import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import sdk from '@cognite/cdf-sdk-singleton';
import { Body, Button, Flex, Tooltip } from '@cognite/cogs.js';
import { SDKProvider } from '@cognite/sdk-provider';

import { DataQualityOverview, UpsertRuleDrawer } from './pages';

export const DataQualityPage = () => {
  return (
    <SDKProvider sdk={sdk}>
      <DataQualityHome />
    </SDKProvider>
  );
};

export const DataQualityHome = () => {
  const { t } = useTranslation('DataQualityHome');

  const upsertRuleDrawer = useDisclosure({ isOpen: false });

  const {
    dataSource,
    error,
    isLoading: loadingDataSource,
  } = useLoadDataSource();
  const {
    isDisabled: validationDisabled,
    isLoading: validationInProgress,
    disabledMessage,
    startValidation,
  } = useStartValidation();
  const {
    isLoading: loadingAccess,
    canReadDataValidation,
    canWriteDataValidation,
    useErrorMessage,
  } = useAccessControl();

  const accessErrorMessageRead = useErrorMessage(
    ActionType.READ_DATA_VALIDATION
  );
  const accessErrorMessageWrite = useErrorMessage(
    ActionType.WRITE_DATA_VALIDATION
  );

  const renderContent = () => {
    if (loadingDataSource || loadingAccess) return <Spinner />;

    if (error)
      return (
        <BasicPlaceholder
          type="EmptyStateFolderSad"
          title={t(
            'data_quality_not_found_ds',
            'Something went wrong. The data source could not be loaded.'
          )}
        >
          <Body level={5}>{JSON.stringify(error?.stack?.error)}</Body>
        </BasicPlaceholder>
      );

    if (!canReadDataValidation)
      return (
        <BasicPlaceholder
          type="SecureSecurity"
          title={t(
            'data_quality_access_error_view',
            'Missing necessary access to view Data Validation.'
          )}
        >
          <Body size="small">{accessErrorMessageRead}</Body>
        </BasicPlaceholder>
      );

    return <DataQualityOverview />;
  };

  return (
    <PageContentLayout>
      <PageContentLayout.Header data-cy="dq-page-header">
        <PageToolbar title={t('data_quality_title', 'Data quality')}>
          {canReadDataValidation && (
            <Flex direction="row" gap={8}>
              <Tooltip
                content={disabledMessage}
                disabled={!validationDisabled}
                wrapped
              >
                <Button
                  disabled={validationDisabled}
                  loading={validationInProgress}
                  onClick={startValidation}
                >
                  {t('data_quality_validate_now', 'Validate now')}
                </Button>
              </Tooltip>
              <Tooltip
                content={accessErrorMessageWrite}
                disabled={canWriteDataValidation}
                wrapped
              >
                <Button
                  disabled={!dataSource || !canWriteDataValidation}
                  onClick={upsertRuleDrawer.onOpen}
                  icon="AddLarge"
                  iconPlacement="right"
                  type="primary"
                >
                  {t('data_quality_new_rule', 'New rule')}
                </Button>
              </Tooltip>
            </Flex>
          )}
        </PageToolbar>
      </PageContentLayout.Header>

      <PageContentLayout.Body data-cy="dq-page-content">
        {renderContent()}
      </PageContentLayout.Body>

      <UpsertRuleDrawer
        isVisible={upsertRuleDrawer.isOpen}
        onCancel={upsertRuleDrawer.onClose}
      />
    </PageContentLayout>
  );
};
