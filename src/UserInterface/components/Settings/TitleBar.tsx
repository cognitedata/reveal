import React from 'react';
import { useSelector } from "react-redux";

import Icon from "../Common/Icon";
import ToolBar from '../Common/ToolBar';
import { ToolBarType } from "@/UserInterface/interfaces/common"

/**
 * TitleBAr component
 */
export default function TitleBar(props: {
  sectionId: string,
  className?: string,
  title: string,
  icon: { type: string, name: string },
  toolBar: ToolBarType,
}) {
  const { className, title, icon, toolBar, sectionId } = props;

  return <div className={`title-bar ${className ? className : ""}`}>
    {icon ?
      <Icon
        type={icon.type}
        name={icon.name} />
      : null}
    <h1>{title}</h1>
    {toolBar && <ToolBar toolBar={toolBar} sectionId={sectionId}></ToolBar>}
  </div>
}
