import React from "react";
import Icon from "@/UserInterface/Components/Icon/Icon";
import ToolBar from "@/UserInterface/Components/ToolBar/ToolBar";
import { ToolBarType } from "@/UserInterface/Components/Settings/Types";

export default function SettingsToolBar(props: {
  sectionId: string;
  className?: string;
  title: string;
  icon: { type: string; name: string };
  toolBar: ToolBarType;
}) {
  const { className, title, icon, toolBar, sectionId } = props;

  return (
    <div className={`title-bar ${className || ""}`}>
      {icon ? <Icon type={icon.type} name={icon.name} /> : null}
      <h1>{title}</h1>
      {toolBar && <ToolBar toolBar={toolBar} sectionId={sectionId} />}
    </div>
  );
}
