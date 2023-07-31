import * as React from 'react';

import { BaseButton } from 'components/Buttons';

import { ColumnButtonWrapper } from './elements';

export interface ColumnButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

export const ColumnButton: React.FC<ColumnButtonProps> = ({
  text,
  onClick,
  disabled,
}) => {
  return (
    <ColumnButtonWrapper>
      <BaseButton
        text={text}
        type="tertiary"
        size="small"
        disabled={disabled}
        onClick={onClick}
      />
    </ColumnButtonWrapper>
  );
};
