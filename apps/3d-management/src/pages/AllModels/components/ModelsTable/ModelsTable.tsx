import React, { ChangeEvent, FC } from 'react';
import { connect } from 'react-redux';

import styled from 'styled-components';

import { Table, Popover, TableProps } from 'antd';
import { ColumnType } from 'antd/lib/table/interface';
import dayjs from 'dayjs';
import { bindActionCreators } from 'redux';

import { Button, Input } from '@cognite/cogs.js';
import { Model3D } from '@cognite/sdk';

import Thumbnail from '../../../../components/Thumbnail';
import { ThumbnailPreviewIcon } from '../../../../components/ThumbnailPreviewIcon';
import {
  setSelectedModels,
  setModelTableState,
} from '../../../../store/modules/App';
import { AppState } from '../../../../store/modules/App/types';
import { DEFAULT_MARGIN_V } from '../../../../utils';
import EmptyState from '../EmptyState';
import { EmptyStateOptions } from '../EmptyState/EmptyState';
import { TableOperations } from '../TableOperations';

import ThreeDContextualizeButton from './ThreeDContextualizeButton';

const NestedTable = styled(Table)`
  && td:last-child {
    padding: 0 48px 0 8px;
  }

  .ant-table-expanded-row > td:last-child .ant-table-thead th {
    border-bottom: 1px solid #e9e9e9;
  }

  .ant-table-expanded-row > td:last-child .ant-table-thead th:first-child {
    padding-left: 0;
  }

  .table-operation a:not(:last-child) {
    margin-right: 24px;
  }

  .ant-table-expanded-row .ant-table-row:last-child td {
    border: none;
  }

  .ant-table-expanded-row thead {
    background: #fafafa;
  }

  .ant-table-expanded-row thead th {
    border: none !important;
  }
`;

type Props = {
  models: Array<Model3D>;
  app: AppState;
  expandedRowRender: (...args: any) => any;
  setModelTableState: (...args: any) => any;
  setSelectedModels: (...args: any) => any;
  refresh: (...args: any) => any;
};

class ModelsTable extends React.Component<Props> {
  get tableDataSource() {
    const searchStr = this.props.app.modelTableState.filters.modelNameFilter
      .toLowerCase()
      .trim();
    return this.props.models.filter((m) =>
      m.name.toLowerCase().includes(searchStr)
    );
  }

  get modelNameFilter() {
    return this.props.app.modelTableState.filters.modelNameFilter;
  }

  get columns(): Array<ColumnType<Model3D>> {
    const sortObj = this.props.app.modelTableState.sorter;
    return [
      {
        title: '',
        key: 'thumbnails',
        width: 30,
        render: (_, record) => {
          return (
            <Popover
              title={record.name}
              trigger="click"
              content={
                <div
                  style={{
                    minHeight: '60px',
                    minWidth: '195px',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Thumbnail
                    modelId={record.id}
                    width="400px"
                    alt="Model thumbnail"
                  />
                </div>
              }
            >
              {ThumbnailPreviewIcon}
            </Popover>
          );
        },
      },
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        sorter: (a, b) => a.name.length - b.name.length,
        sortOrder: (sortObj?.columnKey === 'name' && sortObj?.order) || null,
      },
      {
        title: 'Date Created',
        dataIndex: 'createdTime',
        key: 'createdTime',
        render: (val) => dayjs(val).format('MMM D, YYYY h:mm A'),
        sorter: (a, b) => +a.createdTime - +b.createdTime,
        sortOrder:
          (sortObj?.columnKey === 'createdTime' && sortObj?.order) || null,
      },
      {
        key: 'contextualizationEditor',
        render: (_, record) => <ThreeDContextualizeButton record={record} />,
      },
    ];
  }

  setModelNameFilter = (e: ChangeEvent<HTMLInputElement>) => {
    this.props.setModelTableState({
      filters: { modelNameFilter: e.target?.value || '' },
    });
  };

  // eslint-disable-next-line react/no-unused-class-component-methods
  handleReset = (clearFilters) => () => {
    clearFilters();
  };

  expandRow = (record) => {
    const selectedModels = this.props.app.selectedModels.filter(
      (el) => el !== record.id
    );
    if (this.props.app.selectedModels.length === selectedModels.length) {
      selectedModels.push(record.id);
    }
    this.props.setSelectedModels(selectedModels);
  };

  handleChange = (pagination, _filters, sorter) => {
    this.props.setModelTableState({
      pagination,
      sorter,
    });
  };

  clearSorting = () => {
    this.props.setModelTableState({ sorter: undefined });
  };

  footer = () => (
    <TableOperations>
      <Button onClick={this.clearSorting}>Clear Sorting</Button>
      <Button onClick={this.props.refresh}>Refresh</Button>
    </TableOperations>
  );

  render() {
    return (
      <>
        <Input
          value={this.modelNameFilter}
          onChange={this.setModelNameFilter}
          icon="Search"
          iconPlacement="right"
          title="Search by model name"
          variant="titleAsPlaceholder"
          htmlSize={31}
          containerStyle={{ marginBottom: DEFAULT_MARGIN_V }}
        />
        <NestedTable<FC<TableProps<Model3D>>>
          rowKey={(i: any) => i.id}
          columns={this.columns}
          dataSource={this.tableDataSource}
          onChange={this.handleChange}
          expandedRowRender={this.props.expandedRowRender}
          expandedRowKeys={this.props.app.selectedModels}
          pagination={this.props.app.modelTableState.pagination}
          onRow={(record) => ({
            onClick: () => {
              this.expandRow(record);
            },
          })}
          onExpand={(expanded, record) => this.expandRow(record)}
          locale={{
            emptyText: (
              <EmptyState
                type={EmptyStateOptions.ThreeDModel}
                text="No 3D models available"
              />
            ),
          }}
          footer={this.footer}
        />
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  app: state.app,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setSelectedModels,
      setModelTableState,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ModelsTable);
