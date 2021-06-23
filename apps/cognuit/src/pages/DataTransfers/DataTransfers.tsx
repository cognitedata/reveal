import React, { useContext, useEffect, useState } from 'react';
import 'antd/dist/antd.css';
import { Table } from 'antd';
import ApiContext from 'contexts/ApiContext';
import sortBy from 'lodash/sortBy';
import indexOf from 'lodash/indexOf';
import EmptyTableMessage from 'components/Molecules/EmptyTableMessage/EmptyTableMessage';
import { DataTransferObject, RevisionObject } from 'typings/interfaces';
import DetailView, {
  DetailDataProps,
} from 'components/Organisms/DetailView/DetailView';
import { Loader } from '@cognite/cogs.js';

import { ContentContainer } from '../../elements';
import ErrorMessage from '../../components/Molecules/ErrorMessage';

import Revisions from './Revisions';
import config from './datatransfer.config';
import { ExpandRowIcon, DetailViewWrapper } from './elements';
import { ProgressState } from './types';
import { useDataTransfersState } from './context/DataTransfersContext';
import TableActions from './components/Table/TableActions';

const DataTransfers: React.FC = () => {
  const {
    status,
    data,
    error,
    config: {
      sources,
      selectedConfiguration,
      selectedSource,
      selectedTarget,
      selectedSourceProject,
      selectedTargetProject,
    },
  } = useDataTransfersState();

  const [filteredData, setFilteredData] = useState<DataTransferObject[]>(
    data.data
  );

  const { api } = useContext(ApiContext);

  const [selectedTransfer, setSelectedTransfer] =
    useState<DetailDataProps | null>(null);

  useEffect(() => {
    setFilteredData(data.data);
  }, [data]);

  function handleOpenDetailClick(
    sourceObj: DataTransferObject,
    revision: RevisionObject
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

  if (error) {
    return (
      <ErrorMessage
        message={`Failed to fetch transfers - ${error.message}`}
        fullView
      />
    );
  }

  function renderExpandedRow(record: DataTransferObject) {
    return <Revisions record={record} onDetailClick={handleOpenDetailClick} />;
  }

  function NoDataText() {
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

  if (!sources) {
    return null;
  }

  return (
    <ContentContainer>
      <TableActions setFilteredData={setFilteredData} />
      <Table
        dataSource={filteredData}
        columns={sortBy(data.columns, (obj) =>
          indexOf(config.columnOrder, obj.key)
        )}
        rowKey="id"
        key={`${data.selectedColumnNames.join('')}_${selectedSource}_${
          // eslint-disable-next-line camelcase
          selectedSourceProject?.external_id
          // eslint-disable-next-line camelcase
        }_${selectedTarget}_${selectedTargetProject?.external_id}`}
        expandable={{
          expandedRowRender: renderExpandedRow,
          // eslint-disable-next-line react/prop-types
          expandIcon: ({ expanded, onExpand, record }) => (
            <ExpandRowIcon
              type={expanded ? 'Down' : 'Right'}
              onClick={(e) => onExpand(record, e)}
            />
          ),
        }}
        locale={{
          emptyText: NoDataText(),
        }}
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
