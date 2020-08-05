import React from "react";
import { ToolBarType } from "@/UserInterface/Components/Settings/Types";
import Icon from "@/UserInterface/Components/Icon/Icon";

/**
 * ToolBar component
 * @param props
 */
export default function ToolBar(props: {
  sectionId: string;
  toolBar?: ToolBarType;
}) {
  const { toolBar, sectionId } = props;
  if (!toolBar || !toolBar.length) return null;

  return (
    <div className="tool-bar">
      {toolBar.map((config, index: number) => {
        const { icon, selected } = config;
        return (
          <div
            key={`${sectionId}-toobar-${index}`}
            className={`tool-bar-icon ${selected ? "icon-selected" : ""}`}
          >
            <Icon type={icon.type} name={icon.name} />
          </div>
        );
      })}
    </div>
  );
}
