import React from "react";
import { useDispatch } from "react-redux";

import Icon from "./Icon";
import { ToolBarType } from "@/UserInterface/interfaces/common";
import { onExpandChangeFromToolbar } from "@/UserInterface/redux/actions/settings";

// Assign toolbar actions
function assignToolBarAction(
  sectionId: string,
  iconIndex: number,
  action?: {
    type: string;
    subSectionId?: string;
  }
) {
  if (action) {
    const { type, subSectionId } = action;
    switch (type) { // todo: add default case and more cases or change to if/else
      case "EXPAND":
        return {
          func: onExpandChangeFromToolbar,
          data: {
            sectionId,
            iconIndex,
            subSectionId
          }
        };
    }
  }
  return undefined;
}

/**
 * ToolBar component
 * @param props
 */
export default function ToolBar(props: { sectionId: string; toolBar?: ToolBarType }) {
  const { toolBar, sectionId } = props;
  if (!toolBar || !toolBar.length) return null;

  const dispatch = useDispatch();

  return (
    <div className="tool-bar">
      {toolBar.map((config, index: number) => {
        const { icon, selected, action } = config;
        return (
          <div
            key={`${sectionId}-toobar-${index}`}
            className={`tool-bar-icon ${selected ? "icon-selected" : ""}`}
            onClick={() => {
              const out = assignToolBarAction(sectionId, index, action);
              if (out) {
                const { func, data } = out;
                if (func) {
                  dispatch(func(data));
                }
              }
            }}
          >
            <Icon type={icon.type} name={icon.name} />
          </div>
        );
      })}
    </div>
  );
}
