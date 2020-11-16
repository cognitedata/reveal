import React, { ChangeEvent } from 'react';
import { Metrics } from '@cognite/metrics';
import Table, {
  SorterResult,
  TableCurrentDataSource,
  PaginationConfig,
} from 'antd/lib/table';
import { Button, Input } from '@cognite/cogs.js';
import Icon from 'antd/lib/icon';
import Popover from 'antd/lib/popover';
import styled from 'styled-components';
import dayjs from 'dayjs';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import EmptyState from 'src/pages/AllModels/components/EmptyState';
import { TableOperations } from 'src/pages/AllModels/components/TableOperations';
import Thumbnail from 'src/components/Thumbnail';

import { setSelectedModels, setModelTableState } from 'src/store/modules/App';
import { v3 } from '@cognite/cdf-sdk-singleton';
import { DEFAULT_MARGIN } from 'src/utils';

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

  .ant-table-expanded-row .ant-table-row:last-child td {
    border: none;
  }

  .ant-table-expanded-row .ant-table-thead > tr > th {
    background: none;
  }

  .table-operation a:not(:last-child) {
    margin-right: 24px;
  }

  .ant-table-tbody > .ant-table-row {
    cursor: pointer;
  }

  .ant-table-expanded-row:hover > td {
    background: #fbfbfb;
  }
`;

type ModelsTableFilters = { modelNameFilter: string };

type Props<T = any> = {
  models: Array<v3.Model3D>;
  app: {
    selectedModels: Array<number>;
    modelTableState: {
      pagination: PaginationConfig;
      filters: ModelsTableFilters;
      sorter: SorterResult<T>;
      sortedInfo: TableCurrentDataSource<T>;
    };
  };
  expandedRowRender: (...args: any) => any;
  setModelTableState: (...args: any) => any;
  setSelectedModels: (...args: any) => any;
  refresh: (...args: any) => any;
};

class ModelsTable extends React.Component<Props> {
  metrics = Metrics.create('3D.Models');

  get tableDataSource() {
    const searchStr = this.props.app.modelTableState.filters.modelNameFilter.toLowerCase();
    return this.props.models.filter((m) =>
      m.name.toLowerCase().includes(searchStr)
    );
  }

  get modelNameFilter() {
    return this.props.app.modelTableState.filters.modelNameFilter;
  }

  get columns() {
    const sortObj = this.props.app.modelTableState.sorter || {};
    return [
      {
        title: '',
        key: 'thumbnails',
        width: 30,
        render: (val) => (
          <Popover
            title={val.name}
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
                <Thumbnail modelId={val.id} width="400px" alt={val.id} />
              </div>
            }
          >
            <Icon
              type="eye"
              theme="outlined"
              onClick={(e) => e.stopPropagation()}
              style={{ cursor: 'pointer' }}
            />
          </Popover>
        ),
      },
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        sorter: (a, b) => a.name.length - b.name.length,
        sortOrder: sortObj.columnKey === 'name' && sortObj.order,
      },
      {
        title: 'Date Created',
        dataIndex: 'createdTime',
        key: 'createdTime',
        render: (val) => dayjs(val).format('MMM D, YYYY h:mm A'),
        sorter: (a, b) => a.createdTime - b.createdTime,
        sortOrder: sortObj.columnKey === 'createdTime' && sortObj.order,
      },
    ];
  }

  setModelNameFilter = (e: ChangeEvent<HTMLInputElement>) => {
    this.props.setModelTableState({
      filters: { modelNameFilter: e.target?.value || '' },
    });
  };

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
    this.metrics.track('Expand', { id: record.id });
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
          style={{ maxWidth: 300 }}
          containerStyle={{ marginBottom: DEFAULT_MARGIN }}
        />
        <NestedTable
          rowKey={(i) => i.id}
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
              <EmptyState type="ThreeDModel" text="No 3D models available" />
            ),
          }}
          footer={() => (
            <TableOperations>
              <Button onClick={this.clearSorting}>Clear Sorting</Button>
              {this.props.refresh ? (
                <Button onClick={this.props.refresh}>Refresh</Button>
              ) : null}
            </TableOperations>
          )}
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
