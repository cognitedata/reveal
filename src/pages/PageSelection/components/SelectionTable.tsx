import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Checkbox, message } from 'antd';
import { Asset, FileInfo } from '@cognite/sdk';
import { Tooltip, Colors } from '@cognite/cogs.js';
import isEqual from 'lodash/isEqual';
import { ResourceType, Filter } from 'modules/sdk-builder/types';
import {
  usePrevious,
  useItemsAndFetching,
  Item,
  useSelectedItems,
} from 'hooks';
import { searchCountSelector } from 'pages/PageSelection/selectors';
import { Flex, Table } from 'components/Common';
import { getColumns } from './columns';

type Props = {
  type: ResourceType;
  filter: Filter;
  isSelectAll: boolean;
  selectedRowKeys: number[];
  setSelectAll: (isSelectAll: boolean) => void;
  setSelectedRowKeys: (selectedRowKeys: number[]) => void;
  diagramsToContextualizeIds?: number[];
  showSelected: boolean;
};
type RecordType = (Asset | FileInfo) & unknown;
export default function SelectionTable<T extends RecordType>(
  props: Props
): JSX.Element {
  const {
    type,
    filter,
    isSelectAll,
    selectedRowKeys,
    setSelectAll,
    setSelectedRowKeys,
    diagramsToContextualizeIds,
    showSelected,
  } = props;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [canSelectAll, setCanSelectAll] = useState(true);
  const count = useSelector(searchCountSelector(type, filter));
  const prevIsSelectAll = usePrevious(isSelectAll);
  const prevFilter = usePrevious(filter);
  const isDataEmpty = !count;

  const shouldFilterUpdate = !!prevFilter && !isEqual(prevFilter, filter);

  const { items, fetching } = useItemsAndFetching(
    type,
    filter,
    diagramsToContextualizeIds
  );

  const selectedItems = useSelectedItems(
    items,
    filter,
    isSelectAll,
    selectedRowKeys
  );

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
  const onRowSelect = (record: RecordType, selected: boolean) => {
    if (isSelectAll) {
      message.info('Only manual selection OR select all is supported.');
    }
    if (!isSelectAll && selected) {
      setSelectedRowKeys([...selectedRowKeys, record.id]);
    }
    if (!isSelectAll && !selected) {
      const newSelectedRowKeys = selectedRowKeys.filter(
        (rowKey: number) => rowKey !== record.id
      );
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };

  useEffect(() => {
    if (isSelectAll) {
      setSelectedRowKeys(items.map((item: Item) => item.id));
    } else if (prevIsSelectAll && !!prevIsSelectAll) setSelectedRowKeys([]);
  }, [items, prevIsSelectAll, isSelectAll, setSelectedRowKeys]);

  useEffect(() => {
    if (!shouldFilterUpdate) return;
    setSelectAll(false);
    setSelectedRowKeys([]);
    setCanSelectAll(!filter.search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFilterUpdate]);

  return (
    <Flex
      row
      style={{
        width: '100%',
        border: `1px solid ${Colors['greyscale-grey3'].hex()}`,
        borderRadius: '8px',
        padding: '3px 0',
      }}
    >
      <Table
        columns={getColumns(type)}
        dataSource={showSelected ? selectedItems : items}
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
          // @ts-ignore
          onSelect: onRowSelect,
        }}
        pagination={{
          position: ['bottomLeft'],
          showQuickJumper: true,
          showSizeChanger: true,
          size: 'small',
          pageSize,
          current: page,
          onChange: onPaginationChange,
          onShowSizeChange: onPaginationChange,
        }}
        style={{ width: '100%', borderRadius: '8px' }}
        options={{ narrow: true }}
      />
    </Flex>
  );
}
