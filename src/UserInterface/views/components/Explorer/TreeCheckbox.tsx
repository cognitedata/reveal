import React from "react";
import styled from "styled-components";
import CheckedAll from "../../../assets/images/Icons/Checkboxes/Checked.png";
import BackgroundNormal from "../../../assets/images/Icons/Checkboxes/BackgroundNormal.png";
import BackgroundFilter from "../../../assets/images/Icons/Checkboxes/BackgroundFilter.png";
import Frame from "../../../assets/images/Icons/Checkboxes/Frame.png";
import FrameStippled from "../../../assets/images/icons/Checkboxes/FrameStippled.png";
import FocusNormal from "../../../assets/images/icons/Checkboxes/FocusNormal.png";
import FocusFilter from "../../../assets/images/icons/Checkboxes/FocusFilter.png";

interface SpanProps {
  readonly checked?: boolean;
  readonly disabled?: boolean;
}

const Label = styled.label`
  position: relative;
  width: 100%;
  height: 100%;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

const Span = styled.span<SpanProps>`
  height: 1em;
  width: 1em;
  cursor: pointer;
  background-image: url(${Frame});
  background-size: cover;
  ${Label}:not(.disabled):not(.checked) &:hover {
    background-image: url(${Frame}), url(${FocusNormal});
    background-repeat: no-repeat, no-repeat;
  }
  .filter & {
    background-image: url(${Frame}), url(${BackgroundFilter});
    background-repeat: no-repeat, no-repeat;
  }
  .filter:not(.disabled):not(.checked) &:hover {
    background-image: url(${Frame}), url(${FocusFilter});
    background-repeat: no-repeat, no-repeat;
  }
  .checked & {
    background-image: url(${Frame}), url(${CheckedAll});
    background-repeat: no-repeat, no-repeat;
  }
  .checked &:hover {
    background-image: url(${Frame}), url(${FocusNormal}), url(${CheckedAll});
    background-repeat: no-repeat, no-repeat;
  }
  .checked.filter &:hover {
    background-image: url(${Frame}), url(${FocusFilter}), url(${CheckedAll});
    background-repeat: no-repeat, no-repeat;
  }
  .checked & {
    background-image: url(${Frame}), url(${CheckedAll});
    background-repeat: no-repeat, no-repeat;
  }
  .disabled & {
    background-image: url(${FrameStippled}), url(${BackgroundNormal});
    background-repeat: no-repeat, no-repeat;
    cursor: initial;
  }
  .disabled.filter & {
    background-image: url(${FrameStippled}), url(${BackgroundFilter});
    background-repeat: no-repeat, no-repeat;
    cursor: initial;
  }
`;

export function TreeCheckBox(props: {
  class?: string;
  id: string;
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  filter?: boolean;
  onToggleCheck?: (e: any, state: boolean) => void;
}) {
  let stateClassArr = [];
  if (props.filter) {
    stateClassArr.push("filter");
  }
  if (props.disabled) {
    stateClassArr.push("disabled");
  }
  if (props.checked) {
    stateClassArr.push("checked");
  }
  if (props.indeterminate) {
    stateClassArr.push("indeterminate");
  }
  const handleClick = function(e: any) {
    e.stopPropagation();
    let checkStatus = false;
    if (props.disabled) {
      return true;
    }
    if (!props.checked) {
      checkStatus = true;
    }
    if (props.onToggleCheck) {
      props.onToggleCheck(e, checkStatus);
    }
  };

  return (
    <Label
      className={props.class + ` center ${stateClassArr.join(" ")}`}
      htmlFor={props.id}
    >
      {/* <Input
        type="checkbox"
        id={props.id}
        name={props.id}
        checked={props.checked}
        value={props.value}
        onChange={handleCheck}
      /> */}
      <Span onClick={handleClick} />
    </Label>
  );
}
