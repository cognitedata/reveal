import React from 'react';

import { SearchConfigModal } from '@data-exploration/components';
import useLocalStorageState from 'use-local-storage-state';

import { Flex } from '@cognite/cogs.js';

import {
  FilterIdType,
  searchConfigData as searchConfigDefaultData,
  SearchConfigDataType,
  SearchConfigResourceType,
  SEARCH_CONFIG_LOCAL_STORAGE_KEY,
} from '@data-exploration-lib/core';

import { CommonColumn } from './CommonColumn';
import { ResourceColumns } from './ResourceColumns';

type Props = {
  visible: boolean;
  onCancel: () => void;
  onSave: () => void;
  isDocumentsApiEnabled?: boolean;
};

export const SearchConfig: React.FC<Props> = ({
  visible,
  onCancel,
  onSave,
  isDocumentsApiEnabled = true,
}: Props) => {
  const [searchConfig, setSearchConfig] =
    useLocalStorageState<SearchConfigDataType>(
      SEARCH_CONFIG_LOCAL_STORAGE_KEY,
      {
        defaultValue: searchConfigDefaultData,
        storageSync: true,
      }
    );

  const [configData, setConfigData] =
    React.useState<SearchConfigDataType>(searchConfig);

  const onChangeHandler = (
    enabled: boolean,
    currentResource: SearchConfigResourceType,
    filterId: FilterIdType
  ) => {
    setConfigData((prevState) => {
      return {
        ...prevState,
        [currentResource]: {
          ...prevState[currentResource],
          [filterId]: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore Property does not exist on type
            ...prevState[currentResource][filterId],
            enabled: enabled,
          },
        },
      };
    });
  };

  const onChangeCommonHandler = (enabled: boolean, index: number) => {
    return setConfigData((prevState) => {
      return (Object.keys(prevState) as Array<SearchConfigResourceType>).reduce(
        (array: SearchConfigDataType, currentResource) => {
          const filterId = Object.keys(prevState[currentResource])[
            index
          ] as FilterIdType;

          return {
            ...array,
            [currentResource]: {
              ...prevState[currentResource],
              [filterId]: {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore Property does not exist on type
                ...prevState[currentResource][filterId],
                enabled: enabled,
              },
            },
          };
        },
        {} as SearchConfigDataType
      );
    });
  };

  const handleToggleFuzzySearch = (enabled: boolean, index: number) => {
    return setConfigData((prevState) => {
      return (Object.keys(prevState) as Array<SearchConfigResourceType>).reduce(
        (array: SearchConfigDataType, currentResource) => {
          const filterId = Object.keys(prevState[currentResource])[
            index
          ] as FilterIdType;

          return {
            ...array,
            [currentResource]: {
              ...prevState[currentResource],
              [filterId]: {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore Property does not exist on type
                ...prevState[currentResource][filterId],
                enabledFuzzySearch: enabled,
              },
            },
          };
        },
        {} as SearchConfigDataType
      );
    });
  };

  return (
    <SearchConfigModal
      visible={visible}
      onCancel={() => {
        setConfigData(searchConfig);
        onCancel();
      }}
      onOk={() => {
        setSearchConfig(configData);
        onSave();
      }}
    >
      <Flex data-testid="search-config" style={{ overflow: 'hidden' }}>
        <CommonColumn
          searchConfigData={configData}
          onChange={onChangeCommonHandler}
          onToggleFuzzySearch={handleToggleFuzzySearch}
        />
        <ResourceColumns
          searchConfigData={configData}
          onChange={onChangeHandler}
          isDocumentsApiEnabled={isDocumentsApiEnabled}
        />
      </Flex>
    </SearchConfigModal>
  );
};
