/* eslint-disable @cognite/no-number-z-index */
import React, { useRef, useState } from 'react';
import copy from 'copy-to-clipboard';
import { Button, Tooltip } from '@cognite/cogs.js';

const DEFAULT_COPY_TIMEOUT_DURATION_IN_MS = 2000;

type CopyButtonProps = {
  content?: string;
  timeout?: number;
};

export const CopyButton = ({
  content,
  timeout = DEFAULT_COPY_TIMEOUT_DURATION_IN_MS,
}: CopyButtonProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);
  const copyIconTimeout = useRef<any>();

  const [didCopy, setDidCopy] = useState(false);

  const handleCopy = (): void => {
    copy(content ?? '');
    setDidCopy(true);

    clearTimeout(copyIconTimeout.current);
    copyIconTimeout.current = setTimeout(() => {
      setDidCopy(false);
    }, timeout);
  };

  return (
    <div ref={containerRef}>
      <Tooltip
        appendTo={containerRef.current!}
        content="Copied"
        visible={didCopy}
      >
        <Button
          icon={didCopy ? 'Checkmark' : 'Copy'}
          onClick={handleCopy}
          size="small"
          type="ghost"
        />
      </Tooltip>
    </div>
  );
};
