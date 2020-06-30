import React, { useState } from "react";
import styled from "styled-components";

// icons
import Frame from "@images/Checkboxes/Frame.png";
import FrameStippled from "@images/Checkboxes/FrameStippled.png";
import FocusNormal from "@images/Checkboxes/FocusNormal.png";
import FocusFilter from "@images/Checkboxes/FocusFilter.png";
import BackgroundNormal from "@images/Checkboxes/BackgroundNormal.png";
import BackgroundFilter from "@images/Checkboxes/BackgroundFilter.png";
import CheckedAll from "@images/Checkboxes/CheckedAll.png";
import CheckedSome from "@images/Checkboxes/CheckedSome.png";
import RadioOff from "@images/Checkboxes/RadioOff.png";
import RadioOn from "@images/Checkboxes/RadioOn.png";
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
  cursor: ${props => (props.disabled ? "auto" : "pointer")};
  background-image: ${props => props.background};
  background-repeat: no-repeat;
  background-size: cover;
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
  const [hover, hoverChanged] = useState(false);
  const stateClassArr: string[] = [];

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

  const handleHover = (e: any) => {
    hoverChanged(true);
  };

  const handleHoverLeave = (e: any) => {
    hoverChanged(false);
  };

  const backgroundImage = getBackgroundImage(
    props.disabled,
    hover,
    props.filter,
    props.checked,
    props.indeterminate
  );

  return (
    <Label className={`${props.class} ${stateClassArr.join(" ")}`} htmlFor={props.id}>
      <Span
        onClick={handleClick}
        onMouseEnter={handleHover}
        onMouseLeave={handleHoverLeave}
        background={backgroundImage}
        disabled={props.disabled}
      />
    </Label>
  );
}

const getBackgroundImage = (
  disabled = false,
  hover = false,
  filter = false,
  checked = false,
  indeterminate = false
) => {
  const imageStringArr: string[] = [];
  if (disabled) {
    imageStringArr.push(`url(${FrameStippled})`);
  } else {
    imageStringArr.push(`url(${Frame})`);

    if (checked) {
      imageStringArr.push(`url(${CheckedAll})`);
    } else if (indeterminate) {
      imageStringArr.push(`url(${CheckedSome})`);
    }
    if (hover) {
      if (filter) {
        imageStringArr.push(`url(${FocusFilter})`);
      } else {
        imageStringArr.push(`url(${FocusNormal})`);
      }
    }
  }
  if (filter) {
    imageStringArr.push(`url(${BackgroundFilter})`);
  } else {
    imageStringArr.push(`url(${BackgroundNormal})`);
  }

  return imageStringArr.join(",");
};
