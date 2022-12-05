import { Button } from '@cognite/cogs.js';
import React from 'react';

type Props = {
  onClick: () => void;
  disabled: boolean;
};

export const UploadButton: React.FC<Props> = ({ onClick, disabled }: Props) => {
  return (
    <Button onClick={onClick} icon="Upload" disabled={disabled}>
      Upload
    </Button>
  );
};
