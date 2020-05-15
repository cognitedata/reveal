import React from 'react';
import { useDispatch } from "react-redux";

import Icon from "../Common/Icon";
import { ToolBarActionTypes } from "../../../constants/Icons";
import { onExpandChangeFromToolbar } from "../../../store/actions/settings";

function assignToolBarAction(sectionId, iconIndex, action)
{
  switch (action.type)
  {
    case ToolBarActionTypes.EXPAND:
      return {
        func: onExpandChangeFromToolbar,
        data: {
          sectionId,
          iconIndex,
          subSectionIndex: action.subSectionIndex
        }
      }
    default:
      return null;
  }
}

function generateToolBar(sectionId, nodeId, toolBar)
{
  const dispatch = useDispatch();
  if (!toolBar || !toolBar.length) return null;
  return toolBar.map(({ icon, action }, idx) =>
    <div
      key={`${nodeId}-toolBar-${idx}`}
      className={`tool-bar-icon ${icon.selected ? "icon-selected" : ""}`}
      onClick={() =>
      {
        const { func, data } = assignToolBarAction(sectionId, idx, action);
        if (func)
        {
          dispatch(func(data))
        }
      }
      }
    >
      <Icon
        type={icon.type}
        name={icon.name}
        selected={icon.selected}>
      </Icon>
    </div>)
}

export default function TitleBar(props: {
  sectionId: string,
  className?: string,
  title: string,
  icon,
  toolBar,
})
{
  const { className, title, icon, toolBar, nodeId, sectionId } = props;
  return <div className={`title-bar ${className ? className : ""}`}>
    {icon ?
      <Icon
        type={icon.type}
        name={icon.name}>
      </Icon>
      : null}
    <h1>{title}</h1>
    {generateToolBar(sectionId, nodeId, toolBar)}
  </div>
}