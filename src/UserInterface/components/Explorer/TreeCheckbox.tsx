import React from "react";
import styled from "styled-components";
import {
  Frame,
  FocusNormal,
  BackgroundFilter,
  FocusFilter,
  CheckedAll,
  CheckedSome,
  FrameStippled,
  BackgroundNormal
} from "@/UserInterface/utils/Icon";
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
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const Span = styled.span<SpanProps>`
  height: 0.83em;
  width: 0.83em;
  cursor: pointer;
  background-image: url(${Frame}), url(${BackgroundNormal});
  background-size: cover;
  ${Label}:not(.disabled):not(.checked):not(.indeterminate) &:hover {
    background-image: url(${Frame}), url(${FocusNormal}), url(${BackgroundNormal});
    background-repeat: no-repeat, no-repeat, no-repeat;
  }
  .checked:not(.filter) & {
    background-image: url(${Frame}), url(${CheckedAll}), url(${BackgroundNormal});
    background-repeat: no-repeat, no-repeat, no-repeat;
  }
  .indeterminate:not(.filter) & {
    background-image: url(${Frame}), url(${CheckedSome}), url(${BackgroundNormal});
    background-repeat: no-repeat, no-repeat, no-repeat;
  }
  .disabled:not(.filter) & {
    background-image: url(${FrameStippled}), url(${BackgroundNormal});
    background-repeat: no-repeat, no-repeat, no-repeat;
    cursor: initial;
  }
  .checked:not(.filter) &:hover {
    background-image: url(${Frame}), url(${CheckedAll}), url(${FocusNormal});
    background-repeat: no-repeat, no-repeat, no-repeat;
  }
  .indeterminate:not(.filter) &:hover {
    background-image: url(${Frame}), url(${CheckedSome}), url(${FocusNormal});
    background-repeat: no-repeat, no-repeat, no-repeat;
  }
   .filter & {
    background-image: url(${Frame}), url(${BackgroundFilter});
    background-repeat: no-repeat, no-repeat;
  }
  .filter.checked & {
    background-image: url(${Frame}), url(${CheckedAll}), url(${BackgroundFilter});
    background-repeat: no-repeat, no-repeat, no-repeat;
  }
  .filter.indeterminate & {
    background-image: url(${Frame}), url(${CheckedSome}), url(${BackgroundFilter});
    background-repeat: no-repeat, no-repeat, no-repeat;
  }
  .filter.disabled & {
    background-image: url(${FrameStippled}), url(${BackgroundFilter});
    background-repeat: no-repeat, no-repeat;
    cursor: initial;
  }
  .filter:not(.disabled):not(.checked):not(.indeterminate) &:hover {
    background-image: url(${Frame}), url(${FocusFilter}), url(${BackgroundFilter});
    background-repeat: no-repeat, no-repeat, no-repeat;
  }
  .filter.checked &:hover {
    background-image: url(${Frame}), url(${CheckedAll}), url(${FocusFilter}), url(${BackgroundFilter});
    background-repeat: no-repeat, no-repeat, no-repeat, no-repeat;
  }
  .filter.indeterminate &:hover {
    background-image: url(${Frame}), url(${CheckedSome}), url(${FocusFilter}), url(${BackgroundFilter});
    background-repeat: no-repeat, no-repeat, no-repeat, no-repeat;
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
  const stateClassArr = [];
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
  const handleClick = (e: any) => {
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
    <Label className={props.class + ` ${stateClassArr.join(" ")}`} htmlFor={props.id}>
      <Span onClick={handleClick} />
    </Label>
  );
}
