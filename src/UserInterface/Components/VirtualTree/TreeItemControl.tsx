import { TreeCheckBox } from "@/UserInterface/Components/VirtualTree/TreeCheckbox";
import { TreeRadioButton } from "@/UserInterface/Components/VirtualTree/TreeRadioButton";
import React, { KeyboardEvent, useState } from "react";
import { HTMLUtils } from "@/UserInterface/Foundation/Utils/HTMLUtils";

export function TreeItemButton(props: {
  id: string;
  visible?: boolean;
  radio?: boolean;
  checkbox?: boolean;
  disabled?: boolean;
  checked?: boolean;
  filter?: boolean;
  indeterminate?: boolean;
  onToggleCheck?: (e: any, state: boolean) => void;
}) {
  if (!props.visible) return null;

  const [hover, hoverChanged] = useState(false);

  const handleToggleEvent = (e: any) => {
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

  const onEnter = (e: KeyboardEvent) => {
    return HTMLUtils.onEnter(handleToggleEvent)(e);
  };

  const handleHover = () => {
    hoverChanged(true);
  };

  const handleHoverLeave = () => {
    hoverChanged(false);
  };

  if (props.radio) {
    return (
      <TreeRadioButton
        class="tree-radio-button"
        id={props.id}
        disabled={props.disabled}
        checked={props.checked}
        hover={hover}
        onClick={handleToggleEvent}
        onKeyUp={onEnter}
        onMouseEnter={handleHover}
        onMouseLeave={handleHoverLeave}
        onFocus={handleHover}
        onBlur={handleHoverLeave}
      />
    );
  }
  if (props.checkbox) {
    return (
      <TreeCheckBox
        class="tree-checkbox"
        id={props.id}
        filter={props.filter}
        checked={props.checked}
        indeterminate={props.indeterminate}
        disabled={props.disabled}
        hover={hover}
        onClick={handleToggleEvent}
        onKeyUp={onEnter}
        onMouseEnter={handleHover}
        onMouseLeave={handleHoverLeave}
        onFocus={handleHover}
        onBlur={handleHoverLeave}
      />
    );
  }

  return null;
}
