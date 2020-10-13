import React from 'react';
import PropTypes from 'prop-types';

import Table from 'antd/lib/table';
import { Button } from '@cognite/cogs.js';
import Icon from 'antd/lib/icon';
import Popover from 'antd/lib/popover';
import dayjs from 'dayjs';

import EmptyState from 'components/EmptyState';
import { getContainer } from 'utils';
import { TableOperations } from 'components/TableOperations';
import Status from '../Status';
import Thumbnail from '../Thumbnail';

class RevisionsTable extends React.Component {
  constructor(props) {
    super(props);
    // eslint-disable-next-line react/state-in-constructor
    this.state = {
      sortedInfo: null,
    };
  }

  get columns() {
    let { sortedInfo, filteredInfo } = this.state;
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};
    return [
      {
        title: '',
        width: '50px',
        key: 'thumbnail',
        align: 'center',
        render: (val) =>
          val.thumbnailThreedFileId && (
            <Popover
              width="500px"
              title={dayjs(val.createdTime).format('lll')}
              trigger="click"
              content={
                <Thumbnail fileId={val.thumbnailThreedFileId} width="400px" />
              }
            >
              <Icon
                align="center"
                type="eye"
                theme="outlined"
                onClick={(e) => e.stopPropagation()}
                style={{
                  cursor: 'pointer',
                }}
              />
            </Popover>
          ),
      },
      {
        title: 'Date Created',
        dataIndex: 'createdTime',
        key: 'createdTime',
        render: (val) => dayjs(val).format('MMM D, YYYY h:mm A'),
        sortOrder: sortedInfo.columnKey === 'createdTime' && sortedInfo.order,
        sorter: (a, b) => a.createdTime - b.createdTime,
      },
      {
        title: 'Status',
        key: 'status',
        dataIndex: 'status',
        filters: [
          { text: 'Done', value: 'Done' },
          { text: 'Processing', value: 'Processing' },
          { text: 'Failed', value: 'Failed' },
          { text: 'Queued', value: 'Queued' },
        ],
        onFilter: (filter, item) => filter === item.status,
        filteredValue: filteredInfo.status || null,
        render: (item) => <Status status={item || 'error'} />,
      },
      {
        title: 'Published',
        dataIndex: 'published',
        key: 'published',
        filters: [
          { text: 'Published', value: true },
          { text: 'Unpublished', value: false },
        ],
        filteredValue: filteredInfo.published || null,
        onFilter: (filter, item) => filter === item.published.toString(),
        render: (item) => {
          if (item === true) {
            return 'Published';
          }

          return 'Unpublished';
        },
      },
    ];
  }

  handleChange = (pagination, filters, sorter) => {
    this.setState({
      sortedInfo: sorter,
      filteredInfo: filters,
    });
  };

  clearAll = () => {
    this.setState({
      sortedInfo: null,
      filteredInfo: null,
    });
  };

  render() {
    return (
      <>
        <Table
          loading={!this.props.revisions}
          columns={this.columns}
          dataSource={this.props.revisions.items}
          pagination={false}
          rowKey={(item) => item.id}
          onChange={this.handleChange}
          onRow={(record) => ({
            onClick: () => {
              this.props.onRowClick(record);
            },
          })}
          locale={{
            emptyText: (
              <EmptyState type="ThreeDModel" text="No revisions available" />
            ),
          }}
          getPopupContainer={getContainer}
          footer={() => (
            <TableOperations>
              <Button onClick={this.clearAll}>Clear Sorting and Filters</Button>
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

RevisionsTable.propTypes = {
  revisions: PropTypes.shape({
    id: PropTypes.number,
    items: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
  onRowClick: PropTypes.func.isRequired,
  refresh: PropTypes.func,
};

RevisionsTable.defaultProps = {
  refresh: null,
};

export default RevisionsTable;
