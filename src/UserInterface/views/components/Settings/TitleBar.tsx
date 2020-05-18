import React from 'react';
import { useDispatch } from "react-redux";

import Icon from "../Common/Icon";
import { ToolBarActionTypes } from "../../../constants/Icons";
import { onExpandChangeFromToolbar } from "../../../redux/actions/settings";
import ToolBar from '../Common/ToolBar';

function assignToolBarAction(sectionId, iconIndex, action) {
  switch (action.type) {
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


export default function TitleBar(props: {
  sectionId: string,
  className?: string,
  title: string,
  icon,
  toolBar,
}) {
  const { className, title, icon, toolBar, sectionId } = props;
  return <div className={`title-bar ${className ? className : ""}`}>
    {icon ?
      <Icon
        type={icon.type}
        name={icon.name}>
      </Icon>
      : null}
    <h1>{title}</h1>
    <ToolBar toolBar={toolBar} sectionId={sectionId}></ToolBar>
  </div>
}