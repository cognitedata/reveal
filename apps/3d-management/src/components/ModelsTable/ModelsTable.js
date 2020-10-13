import React from 'react';
import { Metrics } from '@cognite/metrics';
import PropTypes from 'prop-types';
import Table from 'antd/lib/table';
import { Button } from '@cognite/cogs.js';
import Icon from 'antd/lib/icon';
import Popover from 'antd/lib/popover';
import Input from 'antd/lib/input';
import styled from 'styled-components';
import dayjs from 'dayjs';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import EmptyState from 'components/EmptyState';
import { TableOperations } from 'components/TableOperations';
import Thumbnail from '../Thumbnail';

import { setSelectedModels, setModelTableState } from '../../store/modules/App';

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

const SearchDiv = styled.div`
  padding: 8px;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);

  button {
    margin-top: 5px;
  }

  button:not(:last-child) {
    margin-right: 5px;
  }
`;

class ModelsTable extends React.Component {
  metrics = Metrics.create('3D.Models');

  get columns() {
    const {
      app: {
        modelTableState: { sorter, filters },
      },
    } = this.props;

    const sortObj = sorter || {};
    return [
      {
        title: '',
        key: 'thumbnails',
        width: 30,
        render: (val) => (
          <Popover
            width="500px"
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
        filteredValue: filters.name,
        sorter: (a, b) => a.name.length - b.name.length,
        sortOrder: sortObj.columnKey === 'name' && sortObj.order,
        filterDropdown: ({
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
        }) => (
          <SearchDiv>
            <Input
              ref={(ele) => {
                this.searchInput = ele;
              }}
              placeholder="Model name"
              value={selectedKeys[0]}
              onChange={(e) =>
                setSelectedKeys(e.target.value ? [e.target.value] : [])
              }
              onPressEnter={this.handleSearch(selectedKeys, confirm)}
            />
            <Button
              type="primary"
              onClick={this.handleSearch(selectedKeys, confirm)}
            >
              Search
            </Button>
            <Button onClick={this.handleReset(clearFilters)}>Reset</Button>
          </SearchDiv>
        ),
        filterIcon: (filtered) => (
          <Icon
            type="search"
            style={{ color: filtered ? '#108ee9' : '#aaa' }}
          />
        ),
        onFilter: (value, record) =>
          record.name.toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: (visible) => {
          if (visible) {
            setTimeout(() => {
              this.searchInput.focus();
            });
          }
        },
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

  handleSearch = (selectedKeys, confirm) => () => {
    confirm();
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

  handleChange = (pagination, filters, sorter) => {
    this.props.setModelTableState({ pagination, filters, sorter });
  };

  clearAll = () => {
    this.props.setModelTableState({ sorter: undefined });
  };

  render() {
    return (
      <>
        <NestedTable
          rowKey={(i) => i.id}
          columns={this.columns}
          dataSource={this.props.models}
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
              <Button onClick={this.clearAll}>Clear Sorting</Button>
              {this.props.refresh ? (
                <Button type="green" onClick={this.props.refresh}>
                  Refresh
                </Button>
              ) : null}
            </TableOperations>
          )}
        />
      </>
    );
  }
}

ModelsTable.propTypes = {
  models: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number }))
    .isRequired,
  app: PropTypes.shape({
    selectedModels: PropTypes.arrayOf(PropTypes.number),
    modelTableState: PropTypes.shape({
      pagination: PropTypes.shape(),
      filters: PropTypes.shape(),
      sorter: PropTypes.shape(),
      sortedInfo: PropTypes.shape(),
    }).isRequired,
  }).isRequired,
  expandedRowRender: PropTypes.func.isRequired,
  setModelTableState: PropTypes.func.isRequired,
  setSelectedModels: PropTypes.func.isRequired,
  refresh: PropTypes.func,
};

ModelsTable.defaultProps = {
  refresh: null,
};

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
