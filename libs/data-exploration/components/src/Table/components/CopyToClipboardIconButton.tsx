import React from 'react';
import { Button, toast } from '@cognite/cogs.js';
import {
  COPIED_TEXT,
  DASH,
  DATA_EXPLORATION_COMPONENT,
  useClipboard,
  useMetrics,
} from '@data-exploration-lib/core';

export const CopyToClipboardIconButton = ({ value }: { value: string }) => {
  const { hasCopied, onCopy } = useClipboard();
  const trackUsage = useMetrics();
  const handleCopy = (copyValue: string) => {
    onCopy(copyValue);

    toast.success(COPIED_TEXT);
    trackUsage(DATA_EXPLORATION_COMPONENT.CLICK.COPY_TO_CLIPBOARD);
  };

  return (
    <Button
      className="copying-button"
      size="small"
      type="ghost"
      aria-label="Copy button"
      icon={hasCopied ? 'Checkmark' : 'Copy'}
      disabled={value === DASH || value === ''}
      onClick={() => handleCopy(value)}
    />
  );
};
