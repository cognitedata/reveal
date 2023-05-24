import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { useParams } from 'react-router-dom';
import { useSelectedDataModelVersion } from '@platypus-app/hooks/useSelectedDataModelVersion';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { DataModelOptions, useLoadDataSource } from './hooks/useDataSource';

export const DataQualityPage = () => {
  const { t } = useTranslation('DataQualityPage');

  const { dataModelExternalId, space, version } = useParams() as {
    dataModelExternalId: string;
    space: string;
    version: string;
  };
  const { dataModelVersion: selectedDataModelVersion } =
    useSelectedDataModelVersion(version, dataModelExternalId, space);

  const dataModelOptions: DataModelOptions = {
    dataModelId: dataModelExternalId,
    dataModelSpace: space,
    dataModelVersion: selectedDataModelVersion.version,
  };

  const { dataSource, loadingDataSource } = useLoadDataSource({
    dataModelOptions,
    onError: (error) => {
      Notification({
        type: 'error',
        message: `Couldn't load data source. ${error?.message}`,
        errors: JSON.stringify(error?.stack?.error),
      });
    },
  });

  return (
    <PageContentLayout>
      <PageContentLayout.Header data-cy="dq-page-header">
        <PageToolbar title={t('data_quality_title', 'Data quality')} />
        {/*TODO: Add here buttons */}
      </PageContentLayout.Header>

      <PageContentLayout.Body data-cy="dq-page-content">
        {/*TODO: Add here the content of the page */}

        {loadingDataSource ? (
          <Spinner />
        ) : (
          <span>
            Data source id: <b>{dataSource?.externalId}</b>
          </span>
        )}
      </PageContentLayout.Body>
    </PageContentLayout>
  );
};
