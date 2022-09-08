import { Button, Tooltip } from '@cognite/cogs.js';
import { useState } from 'react';

export const CopyButton = ({
  copyFunction,
  className,
}: {
  copyFunction: () => Promise<boolean>;
  className?: string;
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [tooltipContent, setTooltipContent] =
    useState<string>('Copy to clipboard');

  const copyToClipboard = async () => {
    if (await copyFunction()) setTooltipContent('Copied!');
    else setTooltipContent('Unable to copy');

    setCopied(true);
  };

  return (
    <Tooltip visible={copied} content={tooltipContent}>
      <Button
        className={className}
        aria-label="Copy text"
        icon="Copy"
        onClick={copyToClipboard}
        onMouseEnter={() => {
          setCopied(true);
          setTooltipContent('Copy to clipboard');
        }}
        onMouseLeave={() => setCopied(false)}
      />
    </Tooltip>
  );
};
