import React from "react";
import SelectableInput from "@/UserInterface/Components/SelectableInput/SelectableInput";
import ToolbarToolTip from "@/UserInterface/Components/ToolbarToolTip/ToolbarToolTip";

export default function ToolBarSelect(props: {
  options: string[];
  currentValue: string;
  onChange: (value: string) => void;
  tooltip?: {
    text: string;
    placement?: "bottom" | "right-start";
  };
  iconSize?: { width: number; height: number };
}) {
  const { options, currentValue, onChange, tooltip, iconSize } = props;
  const groupStyle = iconSize
    ? { width: iconSize.width, height: iconSize.height }
    : {};

  const dropDown = () => {
    return (
      <div style={groupStyle}>
        <SelectableInput
          options={options}
          value={currentValue}
          onChange={onChange}
          optionHeight={40}
          maxOptions={5}
        />
      </div>
    );
  };

  return (
    <ToolbarToolTip tooltip={tooltip} iconSize={iconSize}>
      {dropDown()}
    </ToolbarToolTip>
  );
}
