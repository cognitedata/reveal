import React, { KeyboardEvent, MouseEvent } from 'react';
import styled from 'styled-components';
import FocusRadioOff from '@images/Checkboxes/FocusRadioOff.png';
import FocusRadioOn from '@images/Checkboxes/FocusRadioOn.png';
import RadioOff from '@images/Checkboxes/RadioOff.png';
import RadioOn from '@images/Checkboxes/RadioOn.png';

interface SpanProps {
  readonly background?: string;
  readonly disabled?: boolean;
  readonly checkable?: boolean;
}

const Label = styled.label`
  position: relative;
  width: 100%;
  height: 100%;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;
const Span = styled.span<SpanProps>`
  height: 0.83em;
  width: 0.83em;
  cursor: ${(props) => (props.checkable ? 'pointer' : 'auto')};
  background-image: ${(props) => props.background};
  background-repeat: no-repeat;
  background-size: cover;
  outline: none;
  filter: ${(props) =>
    props.disabled ? 'grayscale(100%) opacity(0.75)' : 'none'};
`;

interface TreeRadioButtonProps {
  class: string;
  id: string;
  hover: boolean;
  onClick: (e: MouseEvent<any>) => void;
  onKeyUp: (e: KeyboardEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
  checked?: boolean;
  disabled?: boolean;
  checkable?: boolean;
}

export const TreeRadioButton = (props: TreeRadioButtonProps) => {
  const backgroundImage = getBackgroundImage(
    props.checkable,
    props.hover,
    props.checked
  );

  return (
    <Label className={props.class} htmlFor={props.id}>
      <Span
        tabIndex={0}
        background={backgroundImage}
        disabled={props.disabled}
        checkable={props.checkable}
        onClick={props.onClick}
        onKeyUp={props.onKeyUp}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
      />
    </Label>
  );
};

const getBackgroundImage = (
  checkable = true,
  hover = false,
  checked = false
) => {
  const imageStringArr: string[] = [];

  if (checkable) {
    if (hover) {
      if (checked) imageStringArr.push(`url(${FocusRadioOn})`);

      imageStringArr.push(`url(${FocusRadioOff})`);
    } else {
      if (checked) imageStringArr.push(`url(${RadioOn})`);
      imageStringArr.push(`url(${RadioOff})`);
    }
  }

  return imageStringArr.join(',');
};
