import { Button } from '@cognite/cogs.js';
import { useClipboard } from '@data-exploration-components/hooks';
import { toast } from '@cognite/cogs.js';
import { DASH } from '@data-exploration-components/utils';
import React from 'react';

export const CopyToClipboardIconButton = ({ value }: { value: string }) => {
  const { hasCopied, onCopy } = useClipboard();
  const handleCopy = (copyValue: string) => {
    onCopy(copyValue);

    toast.success('Item Successfully copied');
  };

  return (
    <Button
      className="copying-button"
      size="small"
      icon={hasCopied ? 'Checkmark' : 'Copy'}
      disabled={value === DASH || value === ''}
      onClick={() => handleCopy(value)}
    />
  );
};
