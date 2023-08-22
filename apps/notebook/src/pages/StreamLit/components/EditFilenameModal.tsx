import React, { useCallback, useState } from 'react';

import { Modal, Input, Flex } from '@cognite/cogs.js';

import { validStreamlitFilename } from '../common';

type EditFilenameProps = {
  onCancel: () => void;
  onOk: (newFilename: string) => void;
  fileName: string;
  existingFileNames: string[];
};

export const EditFilenameModal = ({
  onCancel,
  onOk,
  fileName,
  existingFileNames,
}: EditFilenameProps) => {
  const [input, setInput] = useState('');

  const validInput = useCallback(() => {
    const fullInputFilename = fileName.startsWith('pages/')
      ? `pages/${input}`
      : input;
    return (
      validStreamlitFilename(input) &&
      !existingFileNames.includes(fullInputFilename)
    );
  }, [input, fileName, existingFileNames]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      validInput() && onOk(input);
    },
    [input, validInput, onOk]
  );

  return (
    <Modal
      visible
      okDisabled={!validInput()}
      onCancel={() => onCancel()}
      onOk={() => onOk(input)}
      title="Enter new filename:"
    >
      <Flex direction="column" gap={8}>
        <form onSubmit={handleSubmit}>
          <Input
            autoFocus
            onFocus={(e) => e.target.select()}
            fullWidth
            defaultValue={fileName.replace('pages/', '')}
            onChange={(event) => setInput(event.target.value)}
          />
        </form>
      </Flex>
    </Modal>
  );
};
