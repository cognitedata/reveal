import "./PanelTitleBar.module.scss";
import React from "react";
import Icon from "@/UserInterface/Components/Icon/Icon";
import ToolBar from "@/UserInterface/Components/ToolBar/ToolBar";
import { ToolBarType } from "@/UserInterface/Components/Settings/Types";
import { Typography } from "@material-ui/core";

export default function PanelTitleBar(props: {
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
      <Typography variant="h2" component="h2" className="title">
        {title}
      </Typography>
      {toolBar && <ToolBar toolBar={toolBar} sectionId={sectionId} />}
    </div>
  );
}
