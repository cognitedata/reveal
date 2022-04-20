import React, { useState } from 'react';
import { Body, Select } from '@cognite/cogs.js';
import { EditPanelProps } from 'src/modules/Common/Components/BulkEdit/bulkEditOptions';
import styled from 'styled-components';
import { AssetSelect } from '@cognite/data-exploration';
import { BulkEditUnsavedState } from 'src/modules/Common/store/common/types';
import { Alert } from 'antd';
import { unsavedAssetsHasOverlaps } from 'src/modules/Common/Components/BulkEdit/Asset/unsavedAssetsHasOverlaps';

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
          <AssetSelect
            isMulti
            selectedAssetIds={bulkEditUnsaved.assetIds?.addedAssetIds}
            onAssetSelected={(selectedItems) => {
              setBulkEditUnsaved({
                ...bulkEditUnsaved,
                assetIds: {
                  ...bulkEditUnsaved.assetIds,
                  addedAssetIds: selectedItems,
                },
              });
            }}
          />
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
          <AssetSelect
            isMulti
            selectedAssetIds={bulkEditUnsaved.assetIds?.removedAssetIds}
            onAssetSelected={(selectedItems) => {
              setBulkEditUnsaved({
                ...bulkEditUnsaved,
                assetIds: {
                  ...bulkEditUnsaved.assetIds,
                  removedAssetIds: selectedItems,
                },
              });
            }}
          />
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
      <SelectContainer>
        <Body level={2}>Task</Body>
        <Select
          value={task}
          onChange={setTask}
          options={taskSelectorOptions}
          closeMenuOnSelect
        />
      </SelectContainer>
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
  align-items: start;
  grid-gap: 8px;
`;
const SelectContainer = styled.div`
  display: grid;
  grid-gap: 6px;
  width: 217px;
`;
const InputContainer = styled.div`
  display: grid;
  grid-gap: 6px;
  width: 400px;
`;
