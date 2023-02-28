import { Flex } from '@cognite/cogs.js';
import { SearchConfigModal } from '@data-exploration/components';
import {
  ResourceType,
  SearchConfigColumnType,
  SearchConfigDataType,
} from '@data-exploration-lib/core';
import React from 'react';
import { CommonColumn } from './CommonColumn';
import { commonColumns } from './constants';

import { ResourceColumns } from './ResourceColumns';

const mockData2: SearchConfigDataType[] = [
  {
    resourceType: 'asset',
    columns: [
      { id: 'name_or_type', label: 'Name', isChecked: true },
      { id: 'description_or_content', label: 'Description', isChecked: true },
      { id: 'external_id', label: 'External Id', isChecked: true },
      { id: 'id', label: 'ID', isChecked: true },
      { id: 'metadata', label: 'Metadata', isChecked: true },
      { id: 'source', label: 'Source', isChecked: true },
      { id: 'label', label: 'Label', isChecked: true },
    ],
  },
  {
    resourceType: 'timeSeries',
    columns: [
      { id: 'name_or_type', label: 'Name', isChecked: true },
      { id: 'description_or_content', label: 'Description', isChecked: true },
      { id: 'external_id', label: 'External Id', isChecked: true },
      { id: 'id', label: 'ID', isChecked: true },
      { id: 'metadata', label: 'Metadata', isChecked: true },
      { id: 'unit', label: 'Unit', isChecked: true },
    ],
  },
  {
    resourceType: 'file',
    columns: [
      { id: 'name_or_type', label: 'Name', isChecked: true },
      { id: 'description_or_content', label: 'Content', isChecked: true },
      { id: 'external_id', label: 'External Id', isChecked: true },
      { id: 'id', label: 'ID', isChecked: true },
      { id: 'metadata', label: 'Metadata', isChecked: true },
      { id: 'source', label: 'Source', isChecked: true },
      { id: 'label', label: 'Label', isChecked: true },
    ],
  },
  {
    resourceType: 'event',
    columns: [
      { id: 'name_or_type', label: 'Type', isChecked: true },
      { id: 'description_or_content', label: 'Description', isChecked: true },
      { id: 'external_id', label: 'External Id', isChecked: true },
      { id: 'id', label: 'ID', isChecked: true },
      { id: 'metadata', label: 'Metadata', isChecked: true },
      { id: 'source', label: 'Source', isChecked: true },
      { id: 'subtype', label: 'Subtype', isChecked: true },
    ],
  },
  {
    resourceType: 'sequence',
    columns: [
      { id: 'name_or_type', label: 'Name', isChecked: true },
      { id: 'description_or_content', label: 'Description', isChecked: true },
      { id: 'external_id', label: 'External Id', isChecked: true },
      { id: 'id', label: 'ID', isChecked: true },
      { id: 'metadata', label: 'Metadata', isChecked: true },
    ],
  },
];

type Props = {
  visible: boolean;
  onCancel: () => void;
  onOk: (data: SearchConfigDataType[]) => void;
  data?: SearchConfigDataType[];
};

export const SearchConfig: React.FC<Props> = ({
  visible,
  onCancel,
  onOk,
  data = mockData2,
}: Props) => {
  const [configData, setConfigData] =
    React.useState<SearchConfigDataType[]>(data);
  const resources = data.map((item) => item.resourceType);
  const numOfResources = resources.length;

  const onChangeHandler = (
    isChecked: boolean,
    resource: ResourceType,
    column: SearchConfigColumnType
  ) => {
    setConfigData((prevState) => {
      return prevState.reduce((arr: SearchConfigDataType[], currentValue) => {
        if (currentValue.resourceType === resource) {
          currentValue.columns.forEach((col) => {
            if (col.id === column.id) {
              col.isChecked = isChecked;
            }
          });
        }
        return [...arr, currentValue];
      }, []);
    });
  };

  const onChangeCommonHandler = (
    isChecked: boolean,
    column: SearchConfigColumnType
  ) => {
    return setConfigData((prevState) =>
      prevState.reduce((arr: SearchConfigDataType[], currentValue) => {
        currentValue.columns.forEach((currentColumn) => {
          if (currentColumn.id === column.id) {
            currentColumn.isChecked = isChecked;
          }
        });
        return [...arr, currentValue];
      }, [])
    );
  };
  return (
    <SearchConfigModal
      visible={visible}
      onCancel={onCancel}
      onOk={() => onOk(configData)}
    >
      <Flex style={{ overflowY: 'hidden' }}>
        <CommonColumn
          data={configData}
          commonColumns={commonColumns}
          resourcesLength={numOfResources}
          onChange={onChangeCommonHandler}
        />
        <ResourceColumns
          data={configData}
          commonColumns={commonColumns}
          onChange={onChangeHandler}
        />
      </Flex>
    </SearchConfigModal>
  );
};
