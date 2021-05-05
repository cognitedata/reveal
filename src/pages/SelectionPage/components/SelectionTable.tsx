import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Table, Checkbox, message } from 'antd';
import { Asset, FileInfo } from '@cognite/sdk';
import { Tooltip } from '@cognite/cogs.js';
import isEqual from 'lodash/isEqual';
import { ResourceType, Filter } from 'modules/sdk-builder/types';
import { usePrevious } from 'hooks';
import {
  searchItemSelector,
  searchCountSelector,
} from 'pages/SelectionPage/selectors';
import { Flex } from 'components/Common';
import { columns } from './columns';

type Props = {
  type: ResourceType;
  filter: Filter;
  isSelectAll: boolean;
  selectedRowKeys: number[];
  setSelectAll: (isSelectAll: boolean) => void;
  setSelectedRowKeys: (selectedRowKeys: number[]) => void;
};

export default function SelectionTable(props: Props): JSX.Element {
  const {
    type,
    filter,
    isSelectAll,
    selectedRowKeys,
    setSelectAll,
    setSelectedRowKeys,
  } = props;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [canSelectAll, setCanSelectAll] = useState(true);

  const { items, fetching } = useSelector(searchItemSelector)(type, filter);
  const count = useSelector(searchCountSelector(type, filter));
  const prevIsSelectAll = usePrevious(isSelectAll);
  const prevFilter = usePrevious(filter);
  const isDataEmpty = !count;

  const onPaginationChange = (newPage: number, newPageSize?: number) => {
    setPage(newPage);
    if (newPageSize) {
      setPageSize(newPageSize);
    }
  };
  const tooltipSelectAll = () => {
    if (isDataEmpty) return 'There are no items in the list to select';
    if (!canSelectAll) return 'You cannot select all with a search query';
    return 'Select all entities';
  };
  const getCheckboxProps = () => {
    return isSelectAll
      ? {
          disabled: true,
        }
      : {};
  };
  const onRowSelect = (resource: Asset | FileInfo, selected: boolean) => {
    if (isSelectAll) {
      message.info('Only manual selection OR select all is supported.');
    }
    if (!isSelectAll && selected) {
      setSelectedRowKeys([...selectedRowKeys, resource.id]);
    }
    if (!isSelectAll && !selected) {
      const newSelectedRowKeys = selectedRowKeys.filter(
        (rowKey: number) => rowKey !== resource.id
      );
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };

  useEffect(() => {
    if (isSelectAll) {
      setSelectedRowKeys(items.map((item) => item.id));
    } else if (prevIsSelectAll && !!prevIsSelectAll) setSelectedRowKeys([]);
  }, [items, prevIsSelectAll, isSelectAll, setSelectedRowKeys]);

  useEffect(() => {
    const shouldFilterUpdate = !!prevFilter && !isEqual(prevFilter, filter);
    if (shouldFilterUpdate) {
      setSelectAll(false);
      setSelectedRowKeys([]);
      setCanSelectAll(!filter.search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, prevFilter]);

  return (
    <Flex row style={{ width: '100%' }}>
      <Table
        // @ts-ignore
        columns={columns}
        dataSource={items.map((item: any) => ({ ...item }))}
        loading={fetching}
        rowKey="id"
        rowSelection={{
          columnWidth: '5%',
          columnTitle: (
            <Tooltip content={tooltipSelectAll()}>
              <Checkbox
                disabled={isDataEmpty || !canSelectAll}
                onChange={(e) => setSelectAll(e.target.checked)}
                checked={isSelectAll}
              />
            </Tooltip>
          ),
          selectedRowKeys,
          getCheckboxProps,
          onSelect: onRowSelect,
        }}
        pagination={{
          position: ['bottomLeft'],
          showQuickJumper: true,
          showSizeChanger: true,
          pageSize,
          current: page,
          onChange: onPaginationChange,
          onShowSizeChange: onPaginationChange,
        }}
        style={{
          width: '100%',
        }}
      />
    </Flex>
  );
}
