import React from 'react';
import { Body, Button, Flex } from '@cognite/cogs.js';

interface Props {
  okText?: string;
  onOk?: () => void;
  onCancel?: () => void;
}

const ModalFooter: React.FC<Props> = ({ okText, onOk, onCancel }) => {
  return (
    <Flex alignItems="center" justifyContent="space-between">
      <Flex gap={8}>
        <Button type="ghost" onClick={() => onCancel?.()}>
          Cancel
        </Button>
        <Button type="primary" onClick={() => onOk?.()}>
          {okText || 'Create'}
        </Button>
      </Flex>
    </Flex>
  );
};

export default ModalFooter;
