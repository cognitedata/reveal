import React from "react";
import SelectableInput from "@/UserInterface/Components/SelectableInput/SelectableInput";
import ToolbarToolTip from "@/UserInterface/Components/ToolbarToolTip/ToolbarToolTip";
import { GenericSelect } from "@/UserInterface/Components/GenericSelect/GenericSelect";

export default function ToolBarSelect(props: {
  options?: string[];
  currentValue?: string;
  onChange?: (value: string) => void;
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
    const genericSelectOpts = options?.map((item) => ({
      label: item,
      value: item,
    }));
    return (
      <div style={groupStyle}>
        <GenericSelect
          options={genericSelectOpts}
          value={currentValue}
          onChange={onChange}
          node={<SelectableInput />}
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
