import React, { KeyboardEvent, MouseEvent } from 'react';
import styled from 'styled-components';

// icons
import Frame from '@images/Checkboxes/Frame.png';
import FrameStippled from '@images/Checkboxes/FrameStippled.png';
import FocusNormal from '@images/Checkboxes/FocusNormal.png';
import FocusFilter from '@images/Checkboxes/FocusFilter.png';
import BackgroundNormal from '@images/Checkboxes/BackgroundNormal.png';
import BackgroundFilter from '@images/Checkboxes/BackgroundFilter.png';
import CheckedAll from '@images/Checkboxes/CheckedAll.png';
import CheckedSome from '@images/Checkboxes/CheckedSome.png';

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

interface TreeCheckBoxProps {
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
  indeterminate?: boolean;
  disabled?: boolean;
  checkable?: boolean;
  filter?: boolean;
}

export const TreeCheckBox = (props: TreeCheckBoxProps) => {
  const stateClassArr: string[] = [];

  if (props.filter) stateClassArr.push('filter');

  if (props.checkable) stateClassArr.push('checkable');
  else stateClassArr.push('uncheckable');

  if (props.checked) stateClassArr.push('checked');
  if (props.indeterminate) stateClassArr.push('indeterminate');
  if (props.disabled) stateClassArr.push('disabled');

  const backgroundImage = getBackgroundImage(
    props.checkable,
    props.hover,
    props.filter,
    props.checked,
    props.indeterminate
  );

  return (
    <Label
      className={`${props.class} ${stateClassArr.join(' ')}`}
      htmlFor={props.id}
    >
      <Span
        tabIndex={0}
        onClick={props.onClick}
        onKeyUp={props.onKeyUp}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
        background={backgroundImage}
        checkable={props.checkable}
        disabled={props.disabled}
      />
    </Label>
  );
};

const getBackgroundImage = (
  checkable = true,
  hover = false,
  filter = false,
  checked = false,
  indeterminate = false
) => {
  const imageStringArr: string[] = [];
  if (checkable) {
    imageStringArr.push(`url(${Frame})`);

    if (checked) imageStringArr.push(`url(${CheckedAll})`);
    else if (indeterminate) imageStringArr.push(`url(${CheckedSome})`);

    if (hover) {
      if (filter) imageStringArr.push(`url(${FocusFilter})`);
      else imageStringArr.push(`url(${FocusNormal})`);
    }
  } else {
    imageStringArr.push(`url(${FrameStippled})`);
  }
  if (filter) imageStringArr.push(`url(${BackgroundFilter})`);
  else imageStringArr.push(`url(${BackgroundNormal})`);

  return imageStringArr.join(',');
};
