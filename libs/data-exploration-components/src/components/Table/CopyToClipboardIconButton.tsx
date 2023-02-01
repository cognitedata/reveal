import React from 'react';
import { Button } from '@cognite/cogs.js';
import { useClipboard } from '@data-exploration-components/hooks';
import { toast } from '@cognite/cogs.js';
import { COPIED_TEXT, DASH } from '@data-exploration-components/utils';
import { useMetrics } from '@data-exploration-components/hooks/useMetrics';
import { DATA_EXPLORATION_COMPONENT } from '@data-exploration-components/constants/metrics';

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
      variant="ghost"
      icon={hasCopied ? 'Checkmark' : 'Copy'}
      disabled={value === DASH || value === ''}
      onClick={() => handleCopy(value)}
    />
  );
};
