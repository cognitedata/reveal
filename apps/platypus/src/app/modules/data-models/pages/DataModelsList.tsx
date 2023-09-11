import { useRef, useState } from 'react';

import { DataModel } from '@platypus/platypus-core';
import { StyledPageWrapper } from '@platypus-app/components/Layouts/elements';
import { FlexPlaceholder } from '@platypus-app/components/Placeholder/FlexPlaceholder';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { useDataModels } from '@platypus-app/hooks/useDataModelActions';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { AgGridReact } from 'ag-grid-react';

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
  // this state is needed to keep re-rendering if quickFilter changes
  // since grid api lives under ref, and ref cannot force re-render
  // this is intermediate state for keeping grid api -> getDisplayedRowCount and state in sync

  const [filterCount, setFilterCount] = useState(0);
  const [searchText, setSearchText] = useState('');

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

  const dataModelsCount = searchText ? filterCount : dataModels.length;

  return (
    <StyledDataModelListWrapper>
      <DataModelsListHeader
        dataModelsCount={dataModelsCount}
        onCreateDataModelClick={() => setIsCreateModalVisible(true)}
        onSearchChange={(newSearchText) => {
          setSearchText(newSearchText);
          gridRef.current?.api.setQuickFilter(newSearchText);
          setFilterCount(gridRef.current?.api.getDisplayedRowCount() as number);
        }}
        searchText={searchText}
      />

      {dataModels && dataModels.length ? (
        <DataModelsTable
          filteredRowsCount={dataModelsCount}
          dataModels={dataModels}
          ref={gridRef}
          onDelete={(dataModel) => setDataModelToDelete(dataModel)}
        />
      ) : (
        renderEmptyList()
      )}
      {isCreateModalVisible && (
        <CreateDataModel
          onCancel={() => setIsCreateModalVisible(false)}
          visible
        />
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
