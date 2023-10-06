import React, { useState } from 'react';

import styled from 'styled-components';

import { Alert } from 'antd';

import { Body, Select } from '@cognite/cogs.js';
import { AssetSelect } from '@cognite/data-exploration';

import { BulkEditUnsavedState } from '../../../store/common/types';
import { EditPanelProps } from '../bulkEditOptions';

import { unsavedAssetsHasOverlaps } from './unsavedAssetsHasOverlaps';

enum TaskOptions {
  add = 'add',
  remove = 'remove',
}
type TaskOptionsType = { value: TaskOptions; label: string };
const taskSelectorOptions: TaskOptionsType[] = [
  {
    value: TaskOptions.add,
    label: 'Add asset(s)',
  },
  {
    value: TaskOptions.remove,
    label: 'Remove asset(s)',
  },
];

const AssetEditPanel = ({
  task,
  bulkEditUnsaved,
  setBulkEditUnsaved,
}: {
  task: TaskOptionsType;
  bulkEditUnsaved: BulkEditUnsavedState;
  setBulkEditUnsaved: (value: BulkEditUnsavedState) => void;
}): JSX.Element => {
  switch (task.value) {
    case TaskOptions.add:
      return (
        <InputContainer>
          <Body level={2}>Add asset</Body>
          <AssetSelectContainer>
            <AssetSelect
              title="Asset ids"
              isMulti
              selectedAssetIds={bulkEditUnsaved.assetIds?.addedAssetIds}
              onAssetSelected={(selectedItems) => {
                setBulkEditUnsaved({
                  ...bulkEditUnsaved,
                  assetIds: {
                    ...bulkEditUnsaved.assetIds,
                    addedAssetIds: selectedItems?.map((x) => x.value),
                  },
                });
              }}
            />
          </AssetSelectContainer>
          {unsavedAssetsHasOverlaps({ bulkEditUnsaved }) && (
            <Alert
              message="Same asset(s) selected for both add and remove."
              banner
              style={{ height: '20px', fontSize: '10px' }}
            />
          )}
        </InputContainer>
      );
    case TaskOptions.remove:
    default:
      return (
        <InputContainer>
          <Body level={2}>Find asset</Body>
          <AssetSelectContainer>
            <AssetSelect
              title="Asset ids"
              isMulti
              selectedAssetIds={bulkEditUnsaved.assetIds?.removedAssetIds}
              onAssetSelected={(selectedItems) => {
                setBulkEditUnsaved({
                  ...bulkEditUnsaved,
                  assetIds: {
                    ...bulkEditUnsaved.assetIds,
                    removedAssetIds: selectedItems?.map((x) => x.value),
                  },
                });
              }}
            />
          </AssetSelectContainer>
        </InputContainer>
      );
  }
};

export const AssetPanel = ({
  bulkEditUnsaved,
  setBulkEditUnsaved,
}: EditPanelProps) => {
  const [task, setTask] = useState<TaskOptionsType>(taskSelectorOptions[0]);

  return (
    <PanelContainer>
      <TaskWrapper>
        <Body level={2}>Task</Body>
        <SelectContainer>
          <Select
            value={task}
            onChange={setTask}
            options={taskSelectorOptions}
            closeMenuOnSelect
          />
        </SelectContainer>
      </TaskWrapper>
      <AssetEditPanel
        task={task}
        bulkEditUnsaved={bulkEditUnsaved}
        setBulkEditUnsaved={setBulkEditUnsaved}
      />
    </PanelContainer>
  );
};

const PanelContainer = styled.div`
  display: grid;
  grid-auto-flow: column;
  justify-content: left;
  align-items: end;
  grid-gap: 8px;
`;
const TaskWrapper = styled.div`
  display: grid;
  grid-gap: 6px;
  height: 62px;
`;
const SelectContainer = styled.div`
  width: 218px;
`;
const InputContainer = styled.div`
  display: grid;
  grid-gap: 6px;
  height: 62px;
`;
const AssetSelectContainer = styled.div`
  width: 400px;
`;
