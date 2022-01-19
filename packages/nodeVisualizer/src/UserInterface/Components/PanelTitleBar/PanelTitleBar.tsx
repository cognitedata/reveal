import React from 'react';
import { ToolBar } from '@/UserInterface/Components/ToolBar/ToolBar';
import { ToolBarType } from '@/UserInterface/Components/Settings/Types';
import { ChromaIcon } from '@/UserInterface/Components/ChromaIcon/ChromaIcon';
import styled from 'styled-components';

interface PanelTitleBarProps {
  sectionId: string;
  title: string;
  icon?: { src?: string; description?: string; color?: string };
  toolBar: ToolBarType;
}

export const PanelTitleBar = (props: PanelTitleBarProps) => {
  const { title, icon, toolBar, sectionId } = props;

  return (
    <PanelTitleWrapper>
      {icon && icon.src ? (
        <ChromaIcon src={icon.src} alt={icon.description} color={icon.color} />
      ) : null}
      <Title>{title}</Title>
      {toolBar && <ToolBar toolBar={toolBar} sectionId={sectionId} />}
    </PanelTitleWrapper>
  );
};

const PanelTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 5px;
`;
const Title = styled.h2`
  margin: 0;
  padding-left: 5px;
`;
