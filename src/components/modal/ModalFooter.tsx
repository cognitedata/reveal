import React from 'react';
import { Body, Button, Flex } from '@cognite/cogs.js';

interface Props {
  data: any[];
  label: string;
  onOk: () => void;
  onCancel: () => void;
}

const ModalFooter: React.FC<Props> = ({ data, label, onOk, onCancel }) => {
  return (
    <Flex alignItems="center" justifyContent="space-between">
      <Body level={2}>
        Selected {data.length} {label}
      </Body>
      <Flex gap={8}>
        <Button type="ghost" onClick={() => onCancel()}>
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={() => onOk()}
          disabled={data.length === 0}
        >
          Add {label}
        </Button>
      </Flex>
    </Flex>
  );
};

export default ModalFooter;
