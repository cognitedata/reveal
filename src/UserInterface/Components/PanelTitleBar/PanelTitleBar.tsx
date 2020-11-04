import './PanelTitleBar.module.scss';
import React from 'react';
import { ToolBar } from '@/UserInterface/Components/ToolBar/ToolBar';
import { ToolBarType } from '@/UserInterface/Components/Settings/Types';
import { ChromaIcon } from '@/UserInterface/Components/ChromaIcon/ChromaIcon';

interface PanelTitleBarProps {
  sectionId: string;
  className?: string;
  title: string;
  icon?: { src?: string; description?: string; color?: string };
  toolBar: ToolBarType;
}

export const PanelTitleBar = (props: PanelTitleBarProps) => {
  const { className, title, icon, toolBar, sectionId } = props;

  return (
    <div className={`title-bar ${className || ''}`}>
      {icon && icon.src ? (
        <ChromaIcon src={icon.src} alt={icon.description} color={icon.color} />
      ) : null}
      <h2 className="title">{title}</h2>
      {toolBar && <ToolBar toolBar={toolBar} sectionId={sectionId} />}
    </div>
  );
};
