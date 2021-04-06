import React, { ChangeEvent, FunctionComponent } from 'react';
import { Colors } from '@cognite/cogs.js';
import { StyledTextArea } from 'styles/StyledForm';
import { DivFlex } from 'styles/flex/StyledFlex';
import { InputWarningIcon } from 'components/icons/InputWarningIcon';

interface OwnProps {
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: () => void;
  isChanged: boolean;
  // eslint-disable-next-line react/require-default-props
  dataTestId?: string;
}

type Props = OwnProps;

const TextAreaWithWarning: FunctionComponent<Props> = ({
  value,
  onChange,
  onBlur,
  isChanged,
  dataTestId = '',
}: Props) => {
  return (
    <DivFlex>
      <StyledTextArea
        name=""
        id=""
        className="cogs-input"
        cols={30}
        rows={10}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
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

export default TextAreaWithWarning;
