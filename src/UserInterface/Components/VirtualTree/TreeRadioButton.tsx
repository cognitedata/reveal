import React, { KeyboardEvent, MouseEvent } from "react";
import styled from "styled-components";
import {
  RadioOff,
  RadioOn,
} from "@/UserInterface/Components/Icon/IconSelector";

interface SpanProps {
  readonly background?: string;
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
  cursor: ${(props) => (props.disabled ? "auto" : "pointer")};
  background-image: ${(props) => props.background};
  background-repeat: no-repeat;
  background-size: cover;
  outline: none;
`;

export function TreeRadioButton(props: {
  class: string;
  id: string;
  hover: boolean;
  onClick: (e: MouseEvent<any>) => void;
  onKeyDown: (e: KeyboardEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
  checked?: boolean;
  disabled?: boolean;
}) {
  const backgroundImage = getBackgroundImage(
    props.disabled,
    props.hover,
    props.checked
  );

  return (
    <Label className={props.class} htmlFor={props.id}>
      <Span
        tabIndex={0}
        background={backgroundImage}
        disabled={props.disabled}
        onClick={props.onClick}
        onKeyDown={props.onKeyDown}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
      />
    </Label>
  );
}

const getBackgroundImage = (
  disabled = false,
  hover = false,
  checked = false
) => {
  const imageStringArr: string[] = [];
  if (!disabled) {
    if (checked) imageStringArr.push(`url(${RadioOn})`);

    imageStringArr.push(`url(${RadioOff})`);

    if (hover) {
      // imageStringArr.push(`radial-gradient(white, lightblue)`);
    }
  }

  return imageStringArr.join(",");
};
