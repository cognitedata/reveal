import React from 'react';
import { UploadButtonWrapper } from '../element';

type Props = {
  onClick: () => void;
  disabled: boolean;
};

export const UploadButton: React.FC<Props> = ({ onClick, disabled }: Props) => {
  return (
    <UploadButtonWrapper onClick={onClick} icon="Upload" disabled={disabled}>
      Upload
    </UploadButtonWrapper>
  );
};
