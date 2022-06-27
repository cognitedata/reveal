import React from 'react';
import { Body, Button, Flex } from '@cognite/cogs.js';

interface Props {
  data: any[];
  index: number;
  onPrev: () => void;
  onNext: () => void;
}

const ModalFooter: React.FC<Props> = ({ data, index, onPrev, onNext }) => {
  return (
    <Flex alignItems="center" justifyContent="space-between">
      <Body level={2}>
        Showing document {index + 1} of {data.length}
      </Body>
      <Flex gap={8}>
        <Button disabled={index === 0} onClick={() => onPrev()}>
          Previous
        </Button>
        <Button
          type="primary"
          onClick={() => onNext()}
          disabled={index === data.length - 1}
        >
          Next
        </Button>
      </Flex>
    </Flex>
  );
};

export default ModalFooter;
