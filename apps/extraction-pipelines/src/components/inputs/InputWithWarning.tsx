import React, { ChangeEvent, FunctionComponent } from 'react';
import { Colors, Input } from '@cognite/cogs.js';
import { DivFlex } from '../../styles/flex/StyledFlex';
import { InputWarningIcon } from './InputWarningIcon';

interface OwnProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: () => void;
  isChanged: boolean;
  // eslint-disable-next-line react/require-default-props
  dataTestId?: string;
}

type Props = OwnProps;

const InputWithWarning: FunctionComponent<Props> = ({
  value,
  onChange,
  onBlur,
  isChanged,
  dataTestId = '',
}: Props) => {
  return (
    <DivFlex>
      <Input
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        fullWidth
        data-testid={dataTestId}
      />
      {isChanged && (
        <InputWarningIcon
          $color={Colors.warning.hex()}
          data-testid={`warning-icon-${dataTestId}`}
        />
      )}
    </DivFlex>
  );
};

export default InputWithWarning;
