import { useState } from 'react';

import { Modal, Input, Flex } from '@cognite/cogs.js';

type EditFilenameProps = {
  onCancel: () => void;
  fileName: string;
  onOk: (newFilename: string) => void;
};

export const EditFilenameModal = ({
  onCancel,
  onOk,
  fileName,
}: EditFilenameProps) => {
  const [input, setInput] = useState('');

  return (
    <Modal
      visible
      okDisabled={!input || !input.endsWith('.py')}
      onCancel={() => onCancel()}
      onOk={() => onOk(input)}
      okText="OK"
      title="Enter new filename:"
    >
      <Flex direction="column" gap={8}>
        <Input
          autoFocus
          onFocus={(e) => e.target.select()}
          fullWidth
          defaultValue={fileName.replace('pages/', '')}
          onChange={(event) => setInput(event.target.value)}
        />
      </Flex>
    </Modal>
  );
};
