import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Tooltip, Icons, Colors } from '@cognite/cogs.js';
import { trackUsage } from 'utils/Metrics';
import { ACTION_COPY } from 'utils/constants';
import { CopyType } from 'components/InteractiveCopyWithText';

interface InteractiveCopyProps {
  text: string;
  copyType: CopyType;
  // eslint-disable-next-line react/require-default-props
  onCopy?: () => void;
}

const InteractiveCopy = ({
  text,
  copyType,
  onCopy: onCopyCallback,
}: InteractiveCopyProps) => {
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (hasCopied) {
      setTimeout(() => {
        setHasCopied(false);
      }, 1000);
    }
  }, [hasCopied]);

  const onCopy = () => {
    const el = document.createElement('textarea');
    trackUsage(ACTION_COPY, { copyType });
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setHasCopied(true);
    if (onCopyCallback) onCopyCallback();
  };
  return (
    <Tooltip
      interactive
      content={
        <div style={{ padding: '0.3125rem 0.5625rem' }}>
          {hasCopied ? 'Copied!' : 'Copy'}
        </div>
      }
    >
      <IconWrapper onClick={() => onCopy()} data-testid="interactive-copy">
        {hasCopied ? <Icons.Check /> : <Icons.Copy />}
      </IconWrapper>
    </Tooltip>
  );
};
const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem;
  svg {
    height: 0.7rem;
    width: 0.7rem;
    path {
      fill: ${Colors.primary.hex()};
    }
  }
`;

export default InteractiveCopy;
