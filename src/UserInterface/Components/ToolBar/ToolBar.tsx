import React from "react";
import { ToolBarType } from "@/UserInterface/Components/Settings/Types";
import Icon from "@/UserInterface/Components/Icon/Icon";
import { BaseCommand } from "@/Core/Commands/BaseCommand";

/**
 * ToolBar component
 * @param props
 */
export default function ToolBar(props: {
  sectionId: string;
  toolBar?: BaseCommand[] | ToolBarType;
}) {
  const { toolBar, sectionId } = props;
  if (!toolBar || !toolBar.length) return null;

  return (
    <div className="tool-bar">
      {(toolBar as []).map((config: any) => {
        let name;
        let icon;
        let invoke;

        if (config instanceof BaseCommand) {
          name = config.getDisplayName();
          icon = (
            <Icon
              src={config.getIcon()}
              tooltip={{ text: config.getTooltip() }}
            />
          );
          invoke = config.invoke.bind(config);
        } else {
          name = config.icon.name;
          icon = <Icon type={config.icon.type} name={config.icon.name} />;
          // invoke,tooltip not implemented for other types of commands
        }

        const selected = config.isChecked;
        return (
          <div
            onClick={invoke}
            tabIndex={0}
            role="button"
            key={`${sectionId}-toolbar-${name}`}
            className={`tool-bar-icon ${selected ? "icon-selected" : ""}`}
          >
            {icon}
          </div>
        );
      })}
    </div>
  );
}
