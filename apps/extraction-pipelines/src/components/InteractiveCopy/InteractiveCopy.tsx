import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Colors, Icon } from '@cognite/cogs.js';
import { StyledTooltip } from 'components/styled';

import { trackUsage } from 'utils/Metrics';

export type CopyType =
  | 'id'
  | 'externalId'
  | 'source'
  | 'dataSetId'
  | 'cronExpression'
  | 'dbName'
  | 'tableName'
  | 'pageLink';

interface InteractiveCopyProps {
  text: string;
  copyType: CopyType;
  showTextInTooltip: boolean;
  onCopy?: () => void;
}

const InteractiveCopy = ({
  text,
  copyType,
  onCopy: onCopyCallback,
  showTextInTooltip,
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
    trackUsage({ t: 'Action.Copy', copyType });
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setHasCopied(true);
    if (onCopyCallback) onCopyCallback();
  };
  return (
    <StyledTooltip
      interactive
      content={
        <div style={{ padding: '0.3125rem 0.5625rem' }}>
          {hasCopied
            ? 'Copied!'
            : `Copy ${showTextInTooltip ? text : ''}`.trim()}
        </div>
      }
    >
      <IconWrapper
        onClick={(e) => {
          e.stopPropagation();
          onCopy();
        }}
        data-testid="interactive-copy"
      >
        {hasCopied ? <Icon type="Checkmark" /> : <Icon type="Copy" />}
      </IconWrapper>
    </StyledTooltip>
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
