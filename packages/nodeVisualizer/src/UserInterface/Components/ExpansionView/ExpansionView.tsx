import React from 'react';
import { ToolBar } from '@/UserInterface/Components/ToolBar/ToolBar';
import { BaseCommand } from '@/Core/Commands/BaseCommand';
import styled from 'styled-components';
import { Icon } from '@cognite/cogs.js';

interface ExpansionViewProps {
  id: string;
  title: string;
  isExpanded?: boolean;
  onSectionExpand: (id: string, expandStatus: boolean) => void;
  toolBar?: BaseCommand[];
  children: any;
}

export const ExpansionView = (props: ExpansionViewProps) => {
  const { id, title, isExpanded, onSectionExpand, toolBar, children } = props;

  return (
    <Collapse>
      <CollapseHeader
        onClick={() => onSectionExpand(id, !isExpanded)}
        role="button"
        tabIndex={0}
      >
        {title}
        <StyledIcon type="ChevronDownLarge" expanded={!!isExpanded} />
      </CollapseHeader>
      {isExpanded ? (
        <CollapsePanel>
          <ToolBar toolBar={toolBar} sectionId={id} />
          {children}
        </CollapsePanel>
      ) : null}
    </Collapse>
  );
};

const Collapse = styled.div`
  max-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  margin-bottom: 5px;

  :last-child {
    margin-bottom: 0;
  }
`;
const CollapseHeader = styled.div`
  padding: 10px;
  background: #dedede;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const CollapsePanel = styled.div`
  overflow: auto;
  padding: 10px;
`;
const StyledIcon = styled(Icon)`
  transform: ${(props: { expanded: boolean }) =>
    props.expanded ? 'rotate(180deg)' : 'rotate(0)'};
`;
