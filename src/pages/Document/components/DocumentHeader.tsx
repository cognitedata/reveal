import { Body, Button, Flex, Popconfirm } from '@cognite/cogs.js';
import { documentConfig } from 'configs/global.config';
import React from 'react';

export type DocumentHeaderAction = 'add' | 'remove';
export const DocumentHeader: React.FC<{
  selectedIdsLength: number;
  dataLength: number;
  onActionClick: (action: DocumentHeaderAction) => void;
}> = ({ selectedIdsLength, dataLength, onActionClick }) => {
  if (selectedIdsLength) {
    return (
      <Flex alignItems="center" gap={8}>
        <Body level="2">{selectedIdsLength} files</Body>
        <Popconfirm
          icon="Info"
          onConfirm={() => onActionClick('remove')}
          content={documentConfig.POPCONFIRM_TEXT}
        >
          <Button icon="Trash" type="danger">
            Remove files
          </Button>
        </Popconfirm>
      </Flex>
    );
  }

  return (
    <Flex alignItems="center" gap={8}>
      <Body level="2">{dataLength} files</Body>

      <Button
        icon="PlusCompact"
        type="primary"
        onClick={() => onActionClick('add')}
      >
        Add files
      </Button>
    </Flex>
  );
};
