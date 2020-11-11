import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Tooltip, Icons, Colors } from '@cognite/cogs.js';

interface InteractiveCopyProps {
  text: string;
  // eslint-disable-next-line react/require-default-props
  onCopy?: () => void;
}

const InteractiveCopy = ({
  text,
  onCopy: onCopyCallback,
}: InteractiveCopyProps) => {
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (hasCopied === true) {
      setTimeout(() => {
        setHasCopied(false);
      }, 1000);
    }
  }, [hasCopied]);

  const onCopy = () => {
    const el = document.createElement('textarea');
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
        <div style={{ padding: '5px 9px' }}>
          {hasCopied ? 'Copied!' : 'Copy'}
        </div>
      }
    >
      <IconWrapper onClick={() => onCopy()}>
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
  svg {
    height: 0.7rem;
    width: 0.7rem;
    path {
      fill: ${Colors.primary.hex()};
    }
  }
`;

export default InteractiveCopy;
