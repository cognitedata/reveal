import React, { useContext, useEffect, useState } from 'react';
import ApiContext from 'contexts/ApiContext';
import EmptyTableMessage from 'components/Molecules/EmptyTableMessage/EmptyTableMessage';
import { Loader, Table } from '@cognite/cogs.js';
import { Revision } from 'types/ApiInterface';
import sortBy from 'lodash/sortBy';
import indexOf from 'lodash/indexOf';
import APIErrorContext from 'contexts/APIErrorContext';
import config from 'configs/datatransfer.config';
import { useDataTransfersState } from 'contexts/DataTransfersContext';
import ErrorMessage from 'components/Molecules/ErrorMessage';

import { ContentContainer } from '../../elements';

import DetailView, {
  DetailDataProps,
} from './components/DetailView/DetailView';
import Revisions from './Revisions';
import { DetailViewWrapper } from './elements';
import { DataTypesTableData, ProgressState } from './types';
import TableActions from './TableActions';

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

  const [filteredData, setFilteredData] = useState<DataTypesTableData[]>(
    data.data
  );

  const [expandedColumns, setExpandedColumns] = React.useState<any>({});

  const { api } = useContext(ApiContext);

  const [selectedTransfer, setSelectedTransfer] =
    useState<DetailDataProps | null>(null);

  useEffect(() => {
    setFilteredData(data.data);
  }, [data]);

  function handleOpenDetailClick(
    sourceObj: DataTypesTableData,
    revision: Revision
  ) {
    setSelectedTransfer({
      isLoading: true,
      id: sourceObj.id,
      source: {},
      target: {},
    });
    const selectedObject: DetailDataProps = {
      isLoading: true,
      id: sourceObj.id,
      source: {
        name: sourceObj.name,
        externalId: sourceObj.external_id,
        crs: sourceObj.crs,
        dataType: sourceObj.datatype,
        createdTime: sourceObj.source_created_time || sourceObj.created_time,
        repository: sourceObj.project,
        businessTag: sourceObj.business_tags.join(', '),
        revision: revision.revision,
        revisionSteps: revision.steps,
        interpreter: sourceObj.author,
        cdfMetadata: sourceObj.cdf_metadata,
      },
      target: {},
    };
    const translation = revision.translations[revision.translations.length - 1];
    api!.objects
      .getSingleObject(translation.revision.object_id)
      .then((response) => {
        if (response?.length > 0) {
          const item = response[0];
          selectedObject.target = {
            name: item.name,
            crs: item.crs,
            dataType: item.datatype,
            createdTime: translation.revision.created_time,
            repository: item.project,
            revision: translation.revision.revision,
            revisionSteps: translation.revision.steps,
            cdfMetadata: item.cdf_metadata,
          };
          selectedObject.isLoading = false;
        }
        setSelectedTransfer(selectedObject);
      });
  }

  const handleRowClick = (rowElement: any) => {
    const { id } = rowElement.original as any;
    setExpandedColumns((prevState: any) => ({
      ...prevState,
      [id]: !expandedColumns[id],
    }));
  };

  function ExpandedRow({ original }: { original: DataTypesTableData }) {
    return (
      <Revisions record={original} onDetailClick={handleOpenDetailClick} />
    );
  }

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
      <TableActions setFilteredData={setFilteredData} />
      <Table<DataTypesTableData>
        filterable
        dataSource={filteredData}
        expandedIds={expandedColumns}
        rowKey={(data, index) => `datatypes-${data.id}-${index}`}
        columns={sortBy(data.columns, (obj) =>
          indexOf(config.columnOrder, obj.accessor)
        )}
        renderSubRowComponent={ExpandedRow}
        onRowClick={handleRowClick}
        locale={{ emptyText: renderNoDataText() }}
      />
      <DetailViewWrapper>
        <DetailView
          onClose={() => setSelectedTransfer(null)}
          data={selectedTransfer}
        />
      </DetailViewWrapper>
    </ContentContainer>
  );
};

export default DataTransfers;
