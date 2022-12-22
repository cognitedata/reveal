import { Button, Flex, Input, Title, Tooltip } from '@cognite/cogs.js';
import { StyledPageWrapper } from '@platypus-app/components/Layouts/elements';
import { FlexPlaceholder } from '@platypus-app/components/Placeholder/FlexPlaceholder';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import config from '@platypus-app/config/config';
import { useCapabilities } from '@platypus-app/hooks/useCapabilities';
import { useDataModels } from '@platypus-app/hooks/useDataModelActions';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { DataModel } from '@platypus/platypus-core';
import { AgGridReact } from 'ag-grid-react';
import { useRef, useState } from 'react';
import { DataModelsListHeader } from '../components/DataModelsListHeader/DataModelsListHeader';
import { DataModelsTable } from '../components/DataModelsTable/DataModelsTable';
import { CreateDataModel } from '../CreateDataModel';
import { DeleteDataModel } from '../DeleteDataModel';
import { StyledDataModelListWrapper } from '../elements';

export const DataModelsList = () => {
  const { t } = useTranslation('data-models');

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [dataModelToDelete, setDataModelToDelete] = useState<
    DataModel | undefined
  >(undefined);

  const gridRef = useRef<AgGridReact>(null);

  const {
    data: dataModels,
    isLoading,
    isError,
    refetch: refetchDataModels,
  } = useDataModels();

  if (isLoading) {
    return (
      <StyledPageWrapper>
        <Spinner />
      </StyledPageWrapper>
    );
  }

  if (isError) {
    return (
      <StyledDataModelListWrapper>
        <div className="emptyList">
          <FlexPlaceholder
            data-cy="data-models-error"
            title={t('error-loading-data-models', 'Unable to load Data Models')}
            description={t(
              'error-loading-data-models',
              'Something went wrong and we were notified about it. We were not able to load data models. Please try to refresh the page or select another type.'
            )}
          />
        </div>
      </StyledDataModelListWrapper>
    );
  }

  const renderEmptyList = () => {
    return (
      <div className="emptyList">
        <FlexPlaceholder
          data-cy="no-data-models"
          title={t('no_data_models_title', 'No data models yet')}
          description={t(
            'no-data-models-body',
            'No Data Models were found. Click Create to create one.'
          )}
        />
      </div>
    );
  };

  return (
    <StyledDataModelListWrapper>
      <DataModelsListHeader
        dataModelsCount={dataModels.length}
        onCreateDataModelClick={() => setIsCreateModalVisible(true)}
        onSearchChange={(newSearchText) =>
          gridRef.current?.api.setQuickFilter(newSearchText)
        }
      />

      {dataModels && dataModels.length ? (
        <DataModelsTable dataModels={dataModels} ref={gridRef} />
      ) : (
        renderEmptyList()
      )}
      {isCreateModalVisible && (
        <CreateDataModel onCancel={() => setIsCreateModalVisible(false)} />
      )}
      {dataModelToDelete && (
        <DeleteDataModel
          dataModel={dataModelToDelete}
          onCancel={() => setDataModelToDelete(undefined)}
          onAfterDeleting={() => refetchDataModels()}
        />
      )}
    </StyledDataModelListWrapper>
  );
};
