import React, { useEffect, useState } from 'react';
import { Body, Button, Input, Select, Tooltip } from '@cognite/cogs.js';
import styled from 'styled-components';
import { Metadata } from '@cognite/cdf-sdk-singleton';
import { BulkEditTempState } from 'src/modules/Explorer/store/explorerSlice';
import { FileState } from 'src/modules/Common/filesSlice';
import { EditPanelProps } from '../bulkEditOptions';

const getMetadataKeys = (
  selectedFiles: FileState[],
  bulkEditTemp: BulkEditTempState
) => {
  const existingMetadataKeys = selectedFiles
    .map((file) => (file.metadata ? Object.keys(file.metadata) : []))
    .flat();
  const newKeys = bulkEditTemp.metadata
    ? Object.keys(bulkEditTemp.metadata)
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
  bulkEditTemp: BulkEditTempState,
  setBulkEditTemp: (value: BulkEditTempState) => void
) => {
  const initialMetadata = existingMetadataKeys.reduce(
    (o, key) => Object.assign(o, { [key]: undefined }),
    {}
  );
  setBulkEditTemp({
    ...bulkEditTemp,
    metadata: {
      ...bulkEditTemp.metadata,
      ...initialMetadata,
    } as Metadata,
  });
};

export const MetadataPanel = ({
  selectedFiles,
  bulkEditTemp,
  editPanelStateOptions,
  setEditing,
  setBulkEditTemp,
}: EditPanelProps) => {
  const { editPanelState, setEditPanelState } = editPanelStateOptions;

  const [updatedValue, setUpdatedValue] = useState<string>('');
  const [newKey, setNewKey] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');
  const [addNewMode, setAddNewMode] = useState(false);
  const [initialUpdatedValue, setInitialUpdatedValue] = useState<string>('');

  const { existingMetadataKeys, metadataSelectOptions } = getMetadataKeys(
    selectedFiles,
    bulkEditTemp
  );
  const activeKey =
    editPanelState.metadataActiveKey || metadataSelectOptions[0];
  const setActiveKey = (key: { value: string; label: string }) => {
    setEditPanelState({ ...editPanelState, metadataActiveKey: key });
  };

  useEffect(() => {
    setInitialMetadataTempState(
      existingMetadataKeys,
      bulkEditTemp,
      setBulkEditTemp
    );
    setActiveKey(metadataSelectOptions[0]);
  }, []);

  useEffect(() => {
    setUpdatedValue(bulkEditTemp.metadata?.[activeKey.label] || '');
    setInitialUpdatedValue(bulkEditTemp.metadata?.[activeKey.label] || '');
    setEditing(false);
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
        content={
          <span data-testid="text-content">
            New key and value cannot be empty
          </span>
        }
        disabled={newValue.trim() !== '' && newKey.trim() !== ''}
      >
        <Button
          type="secondary"
          onClick={() => {
            console.error('Not Implemented!');
            setBulkEditTemp({
              ...bulkEditTemp,
              metadata: {
                ...bulkEditTemp.metadata,
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
        content={
          <span data-testid="text-content">Updated value cannot be empty</span>
        }
        disabled={updatedValue.trim() !== ''}
      >
        <Button
          type="secondary"
          onClick={() => {
            setBulkEditTemp({
              ...bulkEditTemp,
              metadata: {
                ...bulkEditTemp.metadata,
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
