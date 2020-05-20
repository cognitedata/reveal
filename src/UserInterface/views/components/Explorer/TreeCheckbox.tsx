import React from "react";
import styled from "styled-components";
import { IconTypes } from "../../../constants/Icons";
import getIcon from "../../../utils/Icon";

interface SpanProps {
  readonly checked?: boolean;
  readonly disabled?: boolean;
}

const CheckedAll = getIcon(IconTypes.CHECKBOXES, "CheckedAll");
const BackgroundNormal = getIcon(IconTypes.CHECKBOXES, "BackgroundNormal");
const BackgroundFilter = getIcon(IconTypes.CHECKBOXES, "BackgroundFilter");
const Frame = getIcon(IconTypes.CHECKBOXES, "Frame");
const FrameStippled = getIcon(IconTypes.CHECKBOXES, "FrameStippled");
const FocusNormal = getIcon(IconTypes.CHECKBOXES, "FocusNormal");
const FocusFilter = getIcon(IconTypes.CHECKBOXES, "FocusFilter");

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
      return;
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
      <Span onClick={handleClick} />
    </Label>
  );
}
