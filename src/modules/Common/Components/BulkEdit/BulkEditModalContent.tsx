import React, { useEffect, useState } from 'react';
import {
  Body,
  Button,
  Popconfirm,
  Select,
  Title,
  Tooltip,
} from '@cognite/cogs.js';
import { BulkEditUnsavedState } from 'src/modules/Common/store/common/types';
import { VisionFile } from 'src/modules/Common/store/files/types';
import styled from 'styled-components';
import { BulkEditTable } from './BulkEditTable/BulkEditTable';
import {
  bulkEditOptions,
  BulkEditOptionType,
  EditPanelState,
} from './bulkEditOptions';

export type BulkEditModalContentProps = {
  selectedFiles: VisionFile[];
  bulkEditUnsaved: BulkEditUnsavedState;
  onCancel: () => void;
  setBulkEditUnsaved: (value: BulkEditUnsavedState) => void;
  onFinishBulkEdit: () => void;
};

const OptionalPopconfirmButton = (props: {
  buttonText: string;
  onFinish: () => void;
  editing: boolean;
  popconfirm?: boolean;
}) => {
  const button = (
    <Button
      type="primary"
      icon="Upload"
      onClick={props.popconfirm ? () => {} : props.onFinish}
      disabled={props.editing}
    >
      {props.buttonText}
    </Button>
  );
  return props.popconfirm ? (
    <Popconfirm
      icon="WarningFilled"
      placement="bottom-end"
      onConfirm={props.onFinish}
      content="Are you sure you want to perform this action?"
    >
      {button}
    </Popconfirm>
  ) : (
    button
  );
};

export const BulkEditModalContent = ({
  selectedFiles,
  bulkEditUnsaved,
  onCancel,
  setBulkEditUnsaved,
  onFinishBulkEdit,
}: BulkEditModalContentProps) => {
  const [selectedBulkEditOption, setSelectedBulkEditOption] =
    useState<BulkEditOptionType>(bulkEditOptions[0]);
  const [editing, setEditing] = useState<boolean>();
  const [editPanelState, setEditPanelState] = useState<EditPanelState>({});

  const { EditPanel, popconfirmOnApply } = selectedBulkEditOption;
  useEffect(() => {
    setEditing(false);
  }, [selectedBulkEditOption]);

  const handleBulkEditOptionChange = (option: BulkEditOptionType) => {
    setSelectedBulkEditOption(option);
    // Reset unsaved panel state when bulk edit option state has changed
    setBulkEditUnsaved({});
  };

  return (
    <>
      <Title level={4} as="h1">
        Bulk edit files
      </Title>
      <BodyContainer>
        <EditType>
          <Body level={2}>Select data to edit</Body>
          <div style={{ width: '255px' }}>
            <Select
              value={selectedBulkEditOption}
              onChange={handleBulkEditOptionChange}
              options={bulkEditOptions}
            />
          </div>
        </EditType>
        <EditPanel
          selectedFiles={selectedFiles}
          bulkEditUnsaved={bulkEditUnsaved}
          setBulkEditUnsaved={setBulkEditUnsaved}
          setEditing={setEditing}
          editPanelStateOptions={{ editPanelState, setEditPanelState }}
        />
        <BulkEditTable
          data={selectedBulkEditOption.data(
            selectedFiles,
            bulkEditUnsaved,
            editPanelState
          )}
          columns={selectedBulkEditOption.columns}
        />
      </BodyContainer>
      <Footer>
        <RightFooter>
          <Button type="ghost-danger" icon="XLarge" onClick={onCancel}>
            Cancel
          </Button>
          <Tooltip
            content={
              <span data-testid="text-content">
                Please finish your unfinished edits
              </span>
            }
            disabled={!editing}
          >
            <OptionalPopconfirmButton
              buttonText="Apply"
              onFinish={onFinishBulkEdit}
              editing={!!editing}
              popconfirm={popconfirmOnApply}
            />
          </Tooltip>
        </RightFooter>
      </Footer>
    </>
  );
};

const BodyContainer = styled.div`
  display: grid;
  grid-gap: 18px;
  margin: 17px 0px;
`;

const EditType = styled.div`
  display: grid;
  grid-gap: 6px;
`;

const Footer = styled.div`
  display: grid;
  grid-auto-flow: column;
`;

const RightFooter = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-self: center;
  justify-self: end;
  grid-gap: 6px;
`;
