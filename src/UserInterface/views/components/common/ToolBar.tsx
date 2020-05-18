import React from 'react';
import { useDispatch } from "react-redux";

import Icon from './Icon';
import { onExpandChangeFromToolbar } from "../../../redux/actions/settings";

function assignToolBarAction(sectionId, iconIndex, action) {
    switch (action.type) {
        case "EXPAND":
            return {
                func: onExpandChangeFromToolbar,
                data: {
                    sectionId,
                    iconIndex,
                    subSectionIndex: action.subSectionIndex
                }
            }
        default:
            return {};
    }
}


export default function ToolBar(props) {
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
                }} >
                <Icon
                    type={icon.type}
                    name={icon.name}
                >
                </Icon>
            </div>
        })}
    </div>
}