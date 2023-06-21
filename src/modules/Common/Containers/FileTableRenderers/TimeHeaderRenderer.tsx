import React from 'react';
import { SelectableTableCellRendererProps } from 'src/modules/Common/types';
import { Button, Dropdown, Icon, Menu } from '@cognite/cogs.js';
import { SortKeys } from 'src/modules/Common/Utils/SortUtils';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';

export function TimeHeaderRenderer({
  column,
  sortKey,
  reverse,
  setSortKey,
  setReverse,
}: SelectableTableCellRendererProps) {
  const { title } = column;
  let timestampTitle = title;
  let Arrow: JSX.Element | null = null;

  const defaultTimestampKey = useSelector(
    ({ explorerReducer }: RootState) =>
      explorerReducer.sortMeta.defaultTimestampKey
  );

  if (sortKey === SortKeys.uploadedTime) {
    timestampTitle = 'Timestamp (uploaded)';
  } else if (sortKey === SortKeys.createdTime) {
    timestampTitle = 'Timestamp (created)';
  } else if (defaultTimestampKey === SortKeys.uploadedTime) {
    timestampTitle = 'Timestamp (uploaded)';
  } else if (defaultTimestampKey === SortKeys.createdTime) {
    timestampTitle = 'Timestamp (created)';
  }

  if (sortKey === SortKeys.uploadedTime || sortKey === SortKeys.createdTime) {
    switch (reverse) {
      case true:
        Arrow = (
          <Icon type="ArrowDown" size={9} style={{ marginLeft: '5px' }} />
        );
        break;
      case false:
        Arrow = <Icon type="ArrowUp" size={9} style={{ marginLeft: '5px' }} />;
        break;
      default:
        Arrow = null;
        break;
    }
  }

  const MenuContent = (
    <Menu
      style={{
        color: 'black',
      }}
    >
      <Menu.Item
        onClick={() => {
          if (setSortKey) {
            setSortKey(SortKeys.uploadedTime);
          }
          if (setReverse) {
            setReverse(true);
          }
        }}
      >
        Time uploaded (most recent)
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          if (setSortKey) {
            setSortKey(SortKeys.uploadedTime);
          }
          if (setReverse) {
            setReverse(false);
          }
        }}
      >
        Time uploaded (least recent)
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          if (setSortKey) {
            setSortKey(SortKeys.createdTime);
          }
          if (setReverse) {
            setReverse(true);
          }
        }}
      >
        Time created (most recent)
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          if (setSortKey) {
            setSortKey(SortKeys.createdTime);
          }
          if (setReverse) {
            setReverse(false);
          }
        }}
      >
        Time created (least recent)
      </Menu.Item>
    </Menu>
  );
  return (
    <Dropdown content={MenuContent}>
      <Button
        type="ghost"
        aria-label="sort time dropdown button"
        style={{ paddingLeft: '0px', fontSize: '13px', fontWeight: 'bold' }}
      >
        {timestampTitle}
        {Arrow}
      </Button>
    </Dropdown>
  );
}
