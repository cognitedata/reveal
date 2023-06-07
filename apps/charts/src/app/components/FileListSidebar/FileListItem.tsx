import { MouseEventHandler, ReactNode } from 'react';
import { Body, Overline } from '@cognite/cogs.js';
import { PreviewContainer, ImagePreview } from './FileList';

type Props = {
  fileName: string;
  preview: ReactNode;
  isError?: boolean;
  isActive?: boolean;
  onFileClick: MouseEventHandler<HTMLDivElement>;
  errorText: string;
};

export const FileListItem = ({
  fileName,
  preview,
  isActive = false,
  isError = false,
  onFileClick,
  errorText = 'Unable to preview file.',
}: Props) => {
  return (
    <PreviewContainer onClick={onFileClick} isActive={isActive}>
      <Overline level={2}>{fileName}</Overline>
      <ImagePreview>
        {preview}
        {isError && <Body level={3}>{errorText}</Body>}
      </ImagePreview>
    </PreviewContainer>
  );
};
