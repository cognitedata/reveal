import React, { useState, useEffect, PropsWithChildren } from 'react';
import styled from 'styled-components';
import { Tooltip, Icons, Colors } from '@cognite/cogs.js';

interface InteractiveCopyWithTextProps {
  textToCopy: string;
  // eslint-disable-next-line react/require-default-props
  onCopy?: () => void;
}

const InteractiveCopyWithText: React.FC<
  InteractiveCopyWithTextProps & React.HTMLAttributes<HTMLDivElement>
> = ({
  textToCopy,
  onCopy: onCopyCallback,
  children,
  ...rest
}: PropsWithChildren<InteractiveCopyWithTextProps>) => {
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
    el.value = textToCopy;
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
          {hasCopied ? 'Copied!' : `Copy`}
        </div>
      }
    >
      <IconWrapper
        onClick={() => onCopy()}
        data-testid="interactive-copy"
        {...rest}
      >
        {children}
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
    margin-left: 0.5rem;
    height: 0.7rem;
    width: 0.7rem;
    path {
      fill: ${Colors.primary.hex()};
    }
  }
`;

export default InteractiveCopyWithText;
