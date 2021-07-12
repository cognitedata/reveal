import React, { useContext, useEffect, useState } from 'react';
import EmptyTableMessage from 'components/Molecules/EmptyTableMessage/EmptyTableMessage';
import { Loader, Table } from '@cognite/cogs.js';
import APIErrorContext from 'contexts/APIErrorContext';
import config from 'configs/datatransfer.config';
import { useDataTransfersState } from 'contexts/DataTransfersContext';
import ErrorMessage from 'components/Molecules/ErrorMessage';
import { ProgressState } from 'contexts/types/dataTransfersTypes';
import { sortColumnsByRules } from 'utils/sorts';
import { curateTableColumns } from 'utils/Table/curate';

import { ContentContainer } from '../../elements';

import DetailView from './components/DetailView/DetailView';
import { DetailViewWrapper } from './elements';
import TableActions from './TableActions';
import { dataTransfersColumnRules } from './utils/Table/columnRules';
import { generatesDataTypesColumnsFromData } from './utils/Table/generate';
import { DataTransfersTableData } from './types';

const DataTransfers: React.FC = () => {
  const { error } = useContext(APIErrorContext);

  const {
    status,
    data,
    filters: {
      selectedConfiguration,
      selectedSource,
      selectedTarget,
      selectedSourceProject,
      selectedTargetProject,
    },
  } = useDataTransfersState();

  const [filteredData, setFilteredData] = useState<DataTransfersTableData[]>(
    []
  );
  const [selectedRecord, setSelectedRecord] = useState<
    DataTransfersTableData | undefined
  >(undefined);

  function renderNoDataText() {
    let message = 'Select configuration';
    if (selectedSource) {
      if (selectedSourceProject) {
        if (selectedTarget) {
          if (selectedTargetProject) {
            message = 'No data';
          } else {
            message = 'Select target project';
          }
        } else {
          message = 'Select target';
        }
      } else {
        message = 'Select source project';
      }
    }
    if (selectedConfiguration && data.data.length < 1) {
      message = 'No data';
    }

    return (
      <EmptyTableMessage
        text={message}
        isLoading={status === ProgressState.LOADING}
      />
    );
  }

  const handleDetailViewClick = (record: DataTransfersTableData) => {
    setSelectedRecord(record);
  };

  const tableColumns = React.useMemo(() => {
    const generateColumns = generatesDataTypesColumnsFromData(
      data.data,
      data.selectedColumnNames
    );

    const curatedColumns = curateTableColumns<DataTransfersTableData>(
      generateColumns,
      dataTransfersColumnRules({ handleDetailViewClick })
    );

    return sortColumnsByRules(curatedColumns, config.columnOrder);
  }, [data.data, data.selectedColumnNames]);

  useEffect(() => {
    setFilteredData(data.data);
  }, [data.data]);

  if (status === ProgressState.LOADING) {
    <Loader />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={`Failed to fetch transfers - ${error.message} (status: ${error.status})`}
        fullView
      />
    );
  }

  return (
    <ContentContainer>
      <TableActions />
      <Table<DataTransfersTableData>
        filterable
        dataSource={filteredData}
        rowKey={(data) => `datatypes-${data.id}`}
        columns={tableColumns}
        locale={{ emptyText: renderNoDataText() }}
      />
      <DetailViewWrapper>
        {selectedRecord && (
          <DetailView
            onClose={() => setSelectedRecord(undefined)}
            record={selectedRecord}
          />
        )}
      </DetailViewWrapper>
    </ContentContainer>
  );
};

export default DataTransfers;
