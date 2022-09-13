import * as React from 'react';

import { ColumnButton } from '../ColumnButton';

import {
  ChartActionMessage,
  ChartActionButtonWrapper,
  ChartColumBodyFlex,
  ColumnActionWrapper,
} from './elements';

export interface ColumnActionProps {
  actionMessage?: string;
  actionButtonText?: string;
  onClickActionButton?: () => void;
}

export const ColumnAction: React.FC<ColumnActionProps> = ({
  actionMessage,
  actionButtonText,
  onClickActionButton,
}) => {
  if (!actionMessage && !actionButtonText) {
    return null;
  }

  return (
    <ColumnActionWrapper>
      <ChartColumBodyFlex>
        <ChartActionMessage>{actionMessage}</ChartActionMessage>
      </ChartColumBodyFlex>

      <ChartColumBodyFlex>
        <ChartActionButtonWrapper>
          {actionButtonText && (
            <ColumnButton
              text={actionButtonText}
              disabled={!onClickActionButton}
              onClick={() => onClickActionButton?.()}
            />
          )}
        </ChartActionButtonWrapper>
      </ChartColumBodyFlex>
    </ColumnActionWrapper>
  );
};
