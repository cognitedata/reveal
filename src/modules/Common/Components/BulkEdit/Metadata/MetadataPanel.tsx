import React, { useEffect, useState } from 'react';
import { Body, Button, Select, Tooltip } from '@cognite/cogs.js';
import { EditPanelProps } from 'src/modules/Common/Components/BulkEdit/bulkEditOptions';
import { BulkEditUnsavedState } from 'src/modules/Common/store/common/types';
import { VisionFile } from 'src/modules/Common/store/files/types';
import styled from 'styled-components';
import { Metadata } from '@cognite/sdk';
import { Input } from 'antd';

const getMetadataKeys = (
  selectedFiles: VisionFile[],
  bulkEditUnsaved: BulkEditUnsavedState
) => {
  const existingMetadataKeys = selectedFiles
    .map((file) => (file.metadata ? Object.keys(file.metadata) : []))
    .flat();
  const newKeys = bulkEditUnsaved.metadata
    ? Object.keys(bulkEditUnsaved.metadata)
    : [];
  const allMetadataKeys = existingMetadataKeys
    .concat(newKeys)
    .filter((v, i, a) => a.indexOf(v) === i);
  const metadataSelectOptions = allMetadataKeys.map((key) => ({
    value: key,
    label: key,
  }));
  return { existingMetadataKeys, metadataSelectOptions };
};

const setInitialMetadataTempState = (
  existingMetadataKeys: string[],
  bulkEditUnsaved: BulkEditUnsavedState,
  setBulkEditUnsaved: (value: BulkEditUnsavedState) => void
) => {
  const initialMetadata = existingMetadataKeys.reduce(
    (o, key) => Object.assign(o, { [key]: undefined }),
    {}
  );
  setBulkEditUnsaved({
    ...bulkEditUnsaved,
    metadata: {
      ...bulkEditUnsaved.metadata,
      ...initialMetadata,
    } as Metadata,
  });
};

export const MetadataPanel = ({
  selectedFiles,
  bulkEditUnsaved,
  editPanelStateOptions,
  setEditing,
  setBulkEditUnsaved,
}: EditPanelProps) => {
  const { editPanelState, setEditPanelState } = editPanelStateOptions;

  const [updatedValue, setUpdatedValue] = useState<string>('');
  const [newKey, setNewKey] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');
  const [addNewMode, setAddNewMode] = useState(false);
  const [initialUpdatedValue, setInitialUpdatedValue] = useState<string>('');

  const { existingMetadataKeys, metadataSelectOptions } = getMetadataKeys(
    selectedFiles,
    bulkEditUnsaved
  );
  const activeKey =
    editPanelState.metadataActiveKey || metadataSelectOptions[0];
  const setActiveKey = (key: { value: string; label: string }) => {
    setEditPanelState({ ...editPanelState, metadataActiveKey: key });
  };

  useEffect(() => {
    setInitialMetadataTempState(
      existingMetadataKeys,
      bulkEditUnsaved,
      setBulkEditUnsaved
    );
    setActiveKey(metadataSelectOptions[0]);
  }, []);

  useEffect(() => {
    if (activeKey) {
      setUpdatedValue(bulkEditUnsaved.metadata?.[activeKey.label] || '');
      setInitialUpdatedValue(bulkEditUnsaved.metadata?.[activeKey.label] || '');
      setEditing(false);
    }
  }, [activeKey]);

  useEffect(() => {
    if (addNewMode || initialUpdatedValue !== updatedValue) setEditing(true);
    else setEditing(false);
  }, [addNewMode, initialUpdatedValue, updatedValue]);

  return addNewMode ? (
    <PanelContainer>
      <SelectContainer>
        <Body level={2}>Key</Body>
        <Input
          value={newKey}
          onChange={(event) => {
            const { value } = event.target;
            setNewKey(value);
          }}
        />
      </SelectContainer>
      <InputContainer>
        <Body level={2}>Input updated shared value</Body>
        <Input
          value={newValue}
          onChange={(event) => {
            const { value } = event.target;
            setNewValue(value);
          }}
        />
      </InputContainer>
      <Tooltip
        content={<span>New key and value cannot be empty</span>}
        disabled={newValue.trim() !== '' && newKey.trim() !== ''}
      >
        <Button
          type="secondary"
          onClick={() => {
            setBulkEditUnsaved({
              ...bulkEditUnsaved,
              metadata: {
                ...bulkEditUnsaved.metadata,
                [newKey]: newValue,
              } as Metadata,
            });
            setActiveKey({ value: newKey, label: newKey });
            setAddNewMode(false);
            setNewKey('');
            setNewValue('');
          }}
          disabled={newValue.trim() === '' || newKey.trim() === ''}
        >
          Finish
        </Button>
      </Tooltip>
      <Button
        type="tertiary"
        onClick={() => {
          setAddNewMode(false);
          setNewKey('');
          setNewValue('');
        }}
      >
        Cancel
      </Button>
    </PanelContainer>
  ) : (
    <PanelContainer>
      <SelectContainer>
        <Body level={2}>Key</Body>
        <Select
          value={activeKey}
          onChange={setActiveKey}
          options={metadataSelectOptions}
          closeMenuOnSelect
        />
      </SelectContainer>
      <InputContainer>
        <Body level={2}>Input updated shared value</Body>
        <Input
          value={updatedValue}
          onChange={(event) => {
            const { value } = event.target;
            setUpdatedValue(value);
          }}
        />
      </InputContainer>
      <Tooltip
        content={<span>Selected Key or Updated value cannot be empty</span>}
        disabled={updatedValue.trim() !== '' && activeKey !== undefined}
      >
        <Button
          type="secondary"
          onClick={() => {
            setBulkEditUnsaved({
              ...bulkEditUnsaved,
              metadata: {
                ...bulkEditUnsaved.metadata,
                [activeKey.value]: updatedValue,
              } as Metadata,
            });
            setInitialUpdatedValue(updatedValue);
          }}
          disabled={updatedValue.trim() === ''}
        >
          Update
        </Button>
      </Tooltip>
      <Button
        type="tertiary"
        onClick={() => {
          setAddNewMode(true);
        }}
      >
        New
      </Button>
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
const SelectContainer = styled.div`
  display: grid;
  grid-gap: 6px;
  width: 255px;
`;
const InputContainer = styled.div`
  display: grid;
  grid-gap: 6px;
  width: 255px;
`;
