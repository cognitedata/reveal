import { useEffect, useReducer } from 'react';

import { BasicPlaceholder } from '@platypus-app/components/BasicPlaceholder/BasicPlaceholder';
import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { Body } from '@cognite/cogs.js';

import DataQualityContext, {
  dataQualityInitialState,
  dataQualityReducer,
} from './context/DataQualityContext';
import { useLoadDataSource } from './hooks/useLoadDataSource';
import { DataQualityOverview } from './pages';

export const DataQualityPage = () => {
  const { t } = useTranslation('DataQualityPage');

  const { dataSource, error, loadingDataSource } = useLoadDataSource();

  const [dataQualityState, dispatchDataQuality] = useReducer(
    dataQualityReducer,
    dataQualityInitialState
  );

  useEffect(() => {
    /* Change the data source id when there is no data source, or the data source / version has been changed. */
    if (dataQualityState.dataSourceId !== dataSource?.externalId) {
      dispatchDataQuality({
        type: 'UPDATE_DATA_SOURCE_ID',
        payload: { dataSourceId: dataSource?.externalId },
      });
    }
  });

  const renderContent = () => {
    if (loadingDataSource) return <Spinner />;

    if (error)
      return (
        <BasicPlaceholder
          type="EmptyStateFolderSad"
          title={t(
            'data_quality_ds_not_found',
            "Something went wrong. We couldn't load the data source."
          )}
        >
          <Body level={5}>{JSON.stringify(error?.stack?.error)}</Body>
        </BasicPlaceholder>
      );

    return <DataQualityOverview />;
  };

  return (
    <DataQualityContext.Provider
      value={{ dataQualityState, dispatchDataQuality }}
    >
      <PageContentLayout>
        <PageContentLayout.Header data-cy="dq-page-header">
          <PageToolbar title={t('data_quality_title', 'Data quality')} />
          {/*TODO: Add here buttons */}
        </PageContentLayout.Header>

        <PageContentLayout.Body data-cy="dq-page-content">
          {renderContent()}
        </PageContentLayout.Body>
      </PageContentLayout>
    </DataQualityContext.Provider>
  );
};
