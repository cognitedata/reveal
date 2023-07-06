import { useState } from 'react';

import styled from 'styled-components/macro';

import { Tooltip, toast } from '@cognite/cogs.js';
import { Button, Colors } from '@cognite/cogs.js-v9';

export interface CopyValueProps {
  value: number | string;
  tooltip?: JSX.Element | string;
}

export function CopyValue({
  value,
  tooltip = 'Copy to clipboard',
}: CopyValueProps) {
  const [hasCopied, setHasCopied] = useState(false);
  return (
    <Tooltip content={tooltip}>
      <CopyValueButton
        className={hasCopied ? 'has-copied' : ''}
        color="success"
        icon={hasCopied ? 'Checkmark' : 'Copy'}
        size="small"
        type="ghost"
        onClick={async () => {
          await navigator.clipboard.writeText(value.toString());
          toast.info(`Copied '${value}' to clipboard.`, { autoClose: 2000 });
          setHasCopied(true);
          setTimeout(() => {
            setHasCopied(false);
          }, 1000);
        }}
      />
    </Tooltip>
  );
}

const CopyValueButton = styled(Button)`
  height: auto !important;
  transition: all 0.3s linear;
  color: ${Colors['decorative--grayscale--900']}!important;
  &:hover {
    color: ${Colors['decorative--grayscale--1000']}!important;
  }
  &.has-copied {
    background: ${Colors['surface--status-success--muted--default']};
    color: ${Colors['border--status-success--strong']}!important;
  }
  .cogs-icon {
    width: 0.8em !important;
  }
`;
