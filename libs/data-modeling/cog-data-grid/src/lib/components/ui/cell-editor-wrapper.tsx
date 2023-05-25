import React, { ReactElement } from 'react';
import { Chip, Tooltip } from '@cognite/cogs.js';
import * as S from './elements';

export type CellEditorWrapperProps = {
  visible: boolean;
  children: ReactElement;
  errorMessage?: string;
  style?: React.CSSProperties;
};

export const CellEditorWrapper: React.FC<CellEditorWrapperProps> = ({
  visible,
  children,
  style,
  errorMessage = 'This field is required',
}) => {
  return (
    <S.CellEditorWrapper style={style}>
      <Tooltip
        className="cell-editor-tooltip"
        visible={visible}
        content={
          <S.ErrorLabel key="cell-editor-tooltip-error-label">
            <Chip icon="Error" label={errorMessage} type="danger" />
          </S.ErrorLabel>
        }
        elevated
        placement="bottom"
        arrow={false}
      >
        {children}
      </Tooltip>
    </S.CellEditorWrapper>
  );
};
