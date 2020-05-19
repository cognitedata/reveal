import React from 'react';
import { useDispatch } from "react-redux";

import Icon from './Icon';
import { ToolBarType } from "../../../interfaces/common";
import { onExpandChangeFromToolbar } from "../../../redux/actions/settings";

// Assign toolbar actions
function assignToolBarAction(
    sectionId: number,
    iconIndex: number,
    action?: {
        type: string,
        subSectionId?: number
    }) {
    if (action) {
        const { type, subSectionId } = action;
        switch (type) {
            case "EXPAND":
                return {
                    func: onExpandChangeFromToolbar,
                    data: {
                        sectionId,
                        iconIndex,
                        subSectionId: subSectionId
                    }
                }
        }
    }
    return {};
}

/**
 * ToolBar component
 * @param props 
 */
export default function ToolBar(props: {
    toolBar?: ToolBarType,
    sectionId: number
}) {
    const { toolBar, sectionId } = props;
    if (!toolBar || !toolBar.length) return null;

    const dispatch = useDispatch();

    return <div className="tool-bar">
        {toolBar.map((config, index: number) => {
            const { icon, selected, action } = config;
            return <div
                key={`${sectionId}-toobar-${index}`}
                className={`tool-bar-icon ${selected ? "icon-selected" : ""}`}
                onClick={() => {
                    const { func, data } = assignToolBarAction(sectionId, index, action);
                    if (func) {
                        dispatch(func(data))
                    }
                }}>
                <Icon
                    type={icon.type}
                    name={icon.name}
                />
            </div>
        })}
    </div>
}
