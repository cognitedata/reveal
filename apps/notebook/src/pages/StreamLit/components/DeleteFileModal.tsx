import { useState } from 'react';

import { Modal, Input, Body, Flex } from '@cognite/cogs.js';

type DeleteFileProps = {
  onCancel: () => void;
  fileName: string;
  onOk: () => void;
};

export const DeleteFileModal = ({
  onCancel,
  onOk,
  fileName,
}: DeleteFileProps) => {
  const [input, setInput] = useState('');

  return (
    <Modal
      visible
      okDisabled={input !== 'DELETE'}
      onCancel={() => onCancel()}
      onOk={onOk}
      okText="Delete"
      title={`Delete ${fileName}`}
    >
      <Flex direction="column" gap={8}>
        <Body level={2}>
          This will delete <code>{fileName}</code> from your data app and is not
          reversible.
        </Body>
        <Body level={2}>Type &apos;DELETE&apos; to confirm</Body>
        <Input
          autoFocus
          fullWidth
          onChange={(event) => setInput(event.target.value)}
        />
      </Flex>
    </Modal>
  );
};
