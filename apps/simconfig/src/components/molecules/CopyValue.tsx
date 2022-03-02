import { useState } from 'react';

import styled from 'styled-components/macro';

import { Button, Colors, Tooltip, toast } from '@cognite/cogs.js';

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
  padding: 3px !important;
  transition: all 0.3s linear;
  color: ${Colors.black.fade(0.7).toString()}!important;
  &:hover {
    color: ${Colors.black.fade(0.2).toString()}!important;
  }
  &.has-copied {
    background: ${Colors.success.fade(0.9).toString()};
    color: ${Colors.success.darken(0.3).toString()}!important;
  }
  .cogs-icon {
    width: 0.8em !important;
  }
`;
