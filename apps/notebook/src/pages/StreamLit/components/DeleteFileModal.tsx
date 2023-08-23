import { useCallback, useState } from 'react';

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

  const validInput = useCallback(() => input === 'DELETE', [input]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      validInput() && onOk();
    },
    [onOk, validInput]
  );

  return (
    <Modal
      visible
      okDisabled={!validInput()}
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
        <form onSubmit={handleSubmit}>
          <Input
            autoFocus
            fullWidth
            onChange={(event) => setInput(event.target.value)}
          />
        </form>
      </Flex>
    </Modal>
  );
};
