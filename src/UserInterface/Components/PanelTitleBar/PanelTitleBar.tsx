import "./PanelTitleBar.module.scss";
import React from "react";
import ToolBar from "@/UserInterface/Components/ToolBar/ToolBar";
import { ToolBarType } from "@/UserInterface/Components/Settings/Types";
import { Typography } from "@material-ui/core";
import { ChromaIcon } from "@/UserInterface/Components/ChromaIcon/ChromaIcon";

export default function PanelTitleBar(props: {
  sectionId: string;
  className?: string;
  title: string;
  icon?: { src?: string; description?: string; color?: string };
  toolBar: ToolBarType;
}) {
  const { className, title, icon, toolBar, sectionId } = props;

  return (
    <div className={`title-bar ${className || ""}`}>
      {icon && icon.src ? (
        <ChromaIcon src={icon.src} alt={icon.description} color={icon.color} />
      ) : null}
      <Typography variant="h2" component="h2" className="title">
        {title}
      </Typography>
      {toolBar && <ToolBar toolBar={toolBar} sectionId={sectionId} />}
    </div>
  );
}
