import { useDisclosure } from '@data-exploration-components/hooks';
import { useLoadDataSource, useStartValidation } from '@data-quality/hooks';
import { BasicPlaceholder } from '@platypus-app/components/BasicPlaceholder/BasicPlaceholder';
import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { Body, Button, Flex } from '@cognite/cogs.js';

import { DataQualityOverview, UpsertRuleDrawer } from './pages';

export const DataQualityPage = () => {
  const { t } = useTranslation('DataQualityPage');

  const upsertRuleDrawer = useDisclosure({ isOpen: false });

  const {
    dataSource,
    error,
    isLoading: loadingDataSource,
  } = useLoadDataSource();
  const { isLoading: validationInProgress, startValidation } =
    useStartValidation();

  const renderContent = () => {
    if (loadingDataSource) return <Spinner />;

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

    return <DataQualityOverview />;
  };

  return (
    <PageContentLayout>
      <PageContentLayout.Header data-cy="dq-page-header">
        <PageToolbar title={t('data_quality_title', 'Data quality')}>
          <Flex direction="row" gap={8}>
            <Button
              disabled={!dataSource}
              loading={validationInProgress}
              onClick={startValidation}
            >
              {t('data_quality_validate_now', 'Validate now')}
            </Button>
            <Button
              disabled={!dataSource}
              onClick={upsertRuleDrawer.onOpen}
              icon="AddLarge"
              iconPlacement="right"
              type="primary"
            >
              {t('data_quality_new_rule', 'New rule')}
            </Button>
          </Flex>
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
