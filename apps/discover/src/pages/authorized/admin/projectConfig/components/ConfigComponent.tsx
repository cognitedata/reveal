import React, { useCallback } from 'react';

import filter from 'lodash/filter';
import map from 'lodash/map';

import { Button, Flex, Tooltip } from '@cognite/cogs.js';

import { ItemWrapper } from '../layout/elements';
import { ConfigFormProps } from '../types';
import { getLabelFromIdentifier } from '../utils/getLabelFromIdentifier';

import { CreateNewComponent } from './CreateNewComponent';

export const ConfigComponent: React.FC<ConfigFormProps> = ({
  metadataValue,
  value,
  onChange,
  onDelete,
  valuePath,
  metadataPath,
  renderCustomComponent,
  renderDeleteComponent,
  hasChanges,
}) => {
  const [createNewOpened, setCreateNewOpened] = React.useState(false);
  const [deleteModal, setDeleteModal] = React.useState<{
    visible: boolean;
    index: string | number | undefined;
    label: string | undefined;
    id: string | undefined;
  }>({
    visible: false,
    index: undefined,
    label: undefined,
    id: undefined,
  });

  const resetDeleteModal = useCallback(() => {
    setDeleteModal({
      visible: false,
      index: undefined,
      label: undefined,
      id: undefined,
    });
  }, []);

  return (
    <Flex direction="column" gap={16} alignItems="flex-start">
      <Button
        type="secondary"
        icon="Add"
        iconPlacement="right"
        onClick={() => setCreateNewOpened(true)}
      >
        Create New {metadataValue?.label}
      </Button>
      <CreateNewComponent
        opened={createNewOpened}
        setOpened={setCreateNewOpened}
        value={value}
        valuePath={valuePath}
        onChange={onChange}
        renderCustomComponent={renderCustomComponent}
        metadataValue={metadataValue}
        metadataPath={metadataPath}
      />
      {map(value as Array<{ id?: string }>, (datum, index) => {
        const label = getLabelFromIdentifier(
          datum,
          metadataValue?.dataLabelIdentifier,
          `${metadataValue?.label} ${index + 1}`
        );

        return (
          <Flex gap={8} alignItems="center" key={label}>
            <ItemWrapper level="4">{label}</ItemWrapper>
            <Tooltip
              content="Reset or save changes to enable delete"
              disabled={!hasChanges}
            >
              <Button
                disabled={hasChanges}
                icon="Delete"
                aria-label="Delete item"
                onClick={() =>
                  setDeleteModal({ visible: true, index, label, id: datum.id })
                }
              />
            </Tooltip>
          </Flex>
        );
      })}
      {deleteModal.visible
        ? renderDeleteComponent({
            onOk: () => {
              onDelete(
                valuePath,
                filter(
                  value,
                  (val, filterIndex) => filterIndex !== deleteModal.index
                )
              );
              resetDeleteModal();
            },
            onClose: resetDeleteModal,
            type: metadataPath,
            label: deleteModal.label,
            id: deleteModal.id,
          })
        : null}
    </Flex>
  );
};
