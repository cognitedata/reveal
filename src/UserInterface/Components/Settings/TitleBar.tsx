import React from 'react';

import Icon from "../Icon/Icon";
import ToolBar from '../ToolBar/ToolBar';
import {ToolBarType} from "@/UserInterface/Components/Settings/Types";

/**
 * TitleBAr component
 */
export default function TitleBar(props: {
  sectionId: string,
  className?: string,
  title: string,
  icon: { type: string, name: string },
  toolBarType: ToolBarType,
}) {
  const { className, title, icon, toolBarType, sectionId } = props;

  return <div className={`title-bar ${className ? className : ""}`}>
    {icon ?
      <Icon
        type={icon.type}
        name={icon.name} />
      : null}
    <h1>{title}</h1>
    {toolBarType && <ToolBar toolBar={toolBarType} sectionId={sectionId}></ToolBar>}
  </div>
}
