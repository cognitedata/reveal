/* eslint-disable @typescript-eslint/no-misused-promises */
import { useState } from 'react';
import { useSelector } from 'react-redux';

import styled from 'styled-components/macro';

import { Button, Input, Modal } from '@cognite/cogs.js';
import type { LabelDetails } from '@cognite/simconfig-api-sdk/rtk';
import {
  useCreateLabelMutation,
  useDeleteLabelMutation,
  useGetLabelsListQuery,
} from '@cognite/simconfig-api-sdk/rtk';

import { selectProject } from 'store/simconfigApiProperties/selectors';

interface LabelsModalProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

export function LabelsModal({ isOpen, setOpen }: LabelsModalProps) {
  const project = useSelector(selectProject);
  const [createLabel] = useCreateLabelMutation();
  const [deleteLabel] = useDeleteLabelMutation();
  const { data: labelsList } = useGetLabelsListQuery({ project });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const dropdownOptions = labelsList?.labels?.filter((label) =>
    label.name?.toLowerCase().startsWith(searchTerm.toLowerCase())
  );

  const handleLabelCreation = async () => {
    await createLabel({
      project,
      createLabelModel: { labels: [{ name: searchTerm.trim() }] },
    });
    setSearchTerm('');
  };

  const handleLabelDeletion = async (label: LabelDetails) => {
    await deleteLabel({ project, name: label.name ?? '' });
  };

  return (
    <Modal
      closeIcon={false}
      footer={null}
      style={{
        padding: 8,
      }}
      visible={isOpen}
      onCancel={() => {
        setOpen(false);
      }}
    >
      <LabelsModalContainer>
        <Input
          icon="Search"
          iconPlacement="left"
          placeholder="Filter"
          value={searchTerm}
          autoFocus
          fullWidth
          onChange={(ev) => {
            setSearchTerm(ev.target.value);
          }}
        />
        <Button
          className="create-label-button"
          disabled={dropdownOptions?.length !== 0 || !(searchTerm.length > 0)}
          icon="Add"
          type="primary"
          onClick={handleLabelCreation}
        >
          Add label
        </Button>

        <LabelsListDropdown>
          {dropdownOptions?.map((label) => (
            <li key={label.externalId}>
              <div>
                <span>{label.name}</span>
                <div>
                  <Button
                    aria-label="remove-label-from-model"
                    icon="Delete"
                    type="ghost"
                    onClick={async () => handleLabelDeletion(label)}
                  />
                </div>
              </div>
            </li>
          ))}
        </LabelsListDropdown>
      </LabelsModalContainer>
    </Modal>
  );
}

const LabelsModalContainer = styled.div`
  margin-top: 15px;
  .cogs-input,
  .create-label-button {
    width: 100%;
  }
  .create-label-button {
    margin-top: 16px;
  }
`;

const LabelsListDropdown = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 0px !important;
  margin-top: 0.75em;
  overflow: scroll;
  max-height: 385px;
  &::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }
  li {
    border: 0.5px solid var(--cogs-greyscale-grey4);
    &:not(:last-child) {
      margin-bottom: 0.5em;
    }
    border-radius: 2px;
    div {
      padding-left: 0.5em;
      user-select: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
      span {
        max-width: 250px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
  }
`;
