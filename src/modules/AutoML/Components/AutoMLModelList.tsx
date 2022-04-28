/* eslint-disable no-nested-ternary */
import React from 'react';
import { Icon, Title, Body } from '@cognite/cogs.js';
import styled from 'styled-components';
import {
  AutoMLModelCore,
  AutoMLTrainingJob,
} from 'src/api/vision/autoML/types';
import { TableWrapper } from 'src/modules/Common/Components/FileTable/FileTableWrapper';
import { StringRenderer } from 'src/modules/Common/Containers/FileTableRenderers/StringRenderer';
import { StringHeaderRenderer } from 'src/modules/Common/Containers/FileTableRenderers/StringHeaderRenderer';
import ReactBaseTable, { Column, ColumnShape } from 'react-base-table';
import { NameRenderer } from './AutoMLTableRenderer/NameRenderer';
import { IdRenderer } from './AutoMLTableRenderer/IdRenderer';
import { StatusRenderer } from './AutoMLTableRenderer/StatusRenderer';
import { DateRenderer } from './AutoMLTableRenderer/DateRenderer';

export type AutoMLTableDataType = AutoMLModelCore &
  Partial<Omit<AutoMLTrainingJob, 'name' | 'jobId' | 'modelType'>>;

export const AutoMLModelList = (props: {
  jobs?: AutoMLTrainingJob[];
  modelList?: AutoMLModelCore[];
  onRowClick: (id: number) => void;
  selectedModelId?: number;
}) => {
  const data: AutoMLTableDataType[] | undefined = props.modelList?.map(
    (item) => {
      return {
        ...item,
        ...props.jobs?.find((job) => job.jobId === item.jobId),
        key: item.jobId,
      };
    }
  );

  const columns = [
    {
      key: 'name',
      title: 'Model name',
      dataKey: 'name',
      width: 200,
      align: Column.Alignment.LEFT,
      editMode: false,
    },
    {
      key: 'jobId',
      title: 'Training job Id',
      dataKey: 'jobId',
      width: 200,
      align: Column.Alignment.CENTER,
      editMode: false,
    },
    {
      key: 'status',
      title: 'Status',
      dataKey: 'status',
      width: 200,
      align: Column.Alignment.CENTER,
      editMode: false,
    },
    {
      key: 'createdTime',
      title: 'Created time',
      dataKey: 'createdTime',
      width: 200,
      align: Column.Alignment.CENTER,
      editMode: false,
    },
  ];

  const rendererMap: {
    [key: string]: (props: { rowData: AutoMLTableDataType }) => JSX.Element;
  } = {
    name: NameRenderer,
    jobId: IdRenderer,
    status: StatusRenderer,
    createdTime: DateRenderer,
  };

  const Cell = (cellProps: any) => {
    const renderer = rendererMap[cellProps.column.dataKey];
    if (renderer) {
      return renderer(cellProps);
    }
    return StringRenderer(cellProps);
  };
  const HeaderCell = (cellProps: any) => {
    return StringHeaderRenderer(cellProps);
  };

  const components = {
    TableCell: Cell,
    TableHeaderCell: HeaderCell,
  };

  const rowEventHandlers = {
    onClick: ({ rowData }: { rowData: AutoMLTableDataType }) => {
      props.onRowClick(rowData.jobId);
    },
  };

  const rowClassName = ({
    rowData,
  }: {
    columns: ColumnShape<AutoMLTableDataType>[];
    rowData: AutoMLTableDataType;
    rowIndex: number;
  }) => {
    return `clickable ${props.selectedModelId === rowData.jobId && 'active'}`;
  };

  return (
    <Container>
      <TitleBar>
        <Title level={2}>Computer Vision Models</Title>
      </TitleBar>

      {props.modelList && props.modelList.length ? (
        <TableContainer>
          <TableWrapper>
            <ReactBaseTable<AutoMLTableDataType>
              key="ReactBaseTable"
              rowKey="key"
              data={data}
              width={720}
              maxHeight={Infinity}
              columns={columns}
              components={components}
              rowEventHandlers={rowEventHandlers}
              rowClassName={rowClassName}
            />
          </TableWrapper>
        </TableContainer>
      ) : props.modelList && props.modelList.length === 0 ? (
        <StyledBody data-testid="no-model-msg">No models found</StyledBody>
      ) : (
        <StyledIcon data-testid="loading-animation-icon" type="Loading" />
      )}
    </Container>
  );
};

const TableContainer = styled.div`
  overflow: auto;
  .BaseTable__row-cell-text {
    white-space: normal !important;
  }
`;

const Container = styled.div`
  display: grid;
  grid-template-rows: 45px auto;
  grid-template-columns: 100%;
  grid-gap: 10px;
  margin-bottom: 20px;
  padding: 14px;
  width: 100%;
  overflow: auto;
`;

const TitleBar = styled.div`
  display: grid;
  grid-template-columns: auto auto;
`;

const StyledIcon = styled(Icon)`
  display: flex;
  justify-self: center;
  align-content: center;
`;

const StyledBody = styled(Body)`
  display: flex;
  color: '#00000073';
  justify-content: center;
  align-items: center;
`;
