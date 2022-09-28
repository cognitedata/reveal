import React from 'react';
import { Label, Tooltip } from '@cognite/cogs.js';
import { ReactElement } from 'react';
import * as S from './elements';

export type CellEditorWrapperProps = {
  visible: boolean;
  children: ReactElement;
  errorMessage?: string;
};

export const CellEditorWrapper: React.FC<CellEditorWrapperProps> = ({
  visible,
  children,
  errorMessage = 'This field is required',
}) => {
  return (
    <S.CellEditorWrapper>
      <Tooltip
        className="cell-editor-tooltip"
        visible={visible}
        content={
          <S.ErrorLabel key="cell-editor-tooltip-error-label">
            <Label icon="Error" variant="danger">
              {errorMessage}
            </Label>
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
