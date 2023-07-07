import type { ChangeEvent, DragEvent } from 'react';

import styled from 'styled-components/macro';

import { Flex } from '@cognite/cogs.js';
import { Icon } from '@cognite/cogs.js-v9';

import { getFileExtensionFromFileName } from 'utils/formUtils';

interface ComponentProps {
  extensions?: string[];
  onFileSelected: (file?: File) => void;
}

export function FileInput({
  extensions,
  onFileSelected,
}: React.PropsWithoutRef<ComponentProps>) {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFileSelected(event.currentTarget.files?.[0]);
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    const ext = getFileExtensionFromFileName(file.name);

    if (!extensions || extensions.includes(ext)) {
      onFileSelected(event.dataTransfer.files[0]);
    }
  };

  return (
    <DropWrapper
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDrop={onDrop}
    >
      <DropTextWrapper>
        <Flex gap={10} justifyContent="center">
          <Icon size={32} type="Download" /> Drag and drop model file, or browse
          for file below. The file must have a valid extension, which in this
          case is {extensions?.map((ex) => ` ${ex}`).toString()}
        </Flex>
      </DropTextWrapper>
      <div>
        <label className="cogs-btn cogs-btn--padding" htmlFor="file-upload">
          Browse...
          <HiddenInputFile
            accept={extensions?.join(',')}
            id="file-upload"
            type="file"
            onChange={onChange}
          />
        </label>
      </div>
    </DropWrapper>
  );
}

export const DropTextWrapper = styled.div`
  padding: 12px;
  color: var(--cogs-greyscale-grey6);
`;

export const DropWrapper = styled.div`
  border: 2px dashed var(--cogs-border-default);
  border-radius: var(--cogs-border-radius--default);
  background: var(--cogs-bg-accent);
  padding: 24px;
  text-align: center;
`;

export const HiddenInputFile = styled.input`
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
`;
