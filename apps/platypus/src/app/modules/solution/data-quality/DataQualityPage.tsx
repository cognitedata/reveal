import { useLoadDataSource, useStartValidation } from '@data-quality/hooks';
import { BasicPlaceholder } from '@platypus-app/components/BasicPlaceholder/BasicPlaceholder';
import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { Body, Button } from '@cognite/cogs.js';

import { DataQualityOverview } from './pages';

export const DataQualityPage = () => {
  const { t } = useTranslation('DataQualityPage');

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
            "Something went wrong. We couldn't load the data source."
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
          <Button
            disabled={!dataSource}
            loading={validationInProgress}
            onClick={startValidation}
          >
            {t('data_quality_validate_now', 'Validate now')}
          </Button>
        </PageToolbar>
      </PageContentLayout.Header>

      <PageContentLayout.Body data-cy="dq-page-content">
        {renderContent()}
      </PageContentLayout.Body>
    </PageContentLayout>
  );
};
