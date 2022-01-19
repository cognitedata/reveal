import React from 'react';
import { ToolBarType } from '@/UserInterface/Components/Settings/Types';
import { Icon } from '@/UserInterface/Components/Icon/Icon';
import { BaseCommand } from '@/Core/Commands/BaseCommand';
import styled from 'styled-components';

interface ToolBarProps {
  sectionId: string;
  toolBar?: BaseCommand[] | ToolBarType;
}

/**
 * ToolBar component
 * @param props
 */
export const ToolBar = (props: ToolBarProps) => {
  const { toolBar, sectionId } = props;
  if (!toolBar || !toolBar.length) return null;

  return (
    <ToolbarWrapper>
      {(toolBar as []).map((config: any) => {
        let name;
        let icon;
        let invoke;

        if (config instanceof BaseCommand) {
          name = config.getDisplayName();
          icon = (
            <Icon
              src={config.getIcon()}
              tooltip={{ text: config.getTooltip() }}
              iconSize={{ width: 16, height: 16 }}
            />
          );
          invoke = config.invoke.bind(config);
        } else {
          name = config.icon.name;
          icon = (
            <Icon
              type={config.icon.type}
              name={config.icon.name}
              iconSize={{ width: 10, height: 10 }}
            />
          );
          // invoke,tooltip not implemented for other types of commands
        }

        const selected = config.isChecked;

        const handleClick = (event) => {
          event.stopPropagation();
          invoke();
        };

        return (
          <ToolbarIcon
            selected={selected}
            onClick={handleClick}
            tabIndex={0}
            role="button"
            key={`${sectionId}-toolbar-${name}`}
          >
            {icon}
          </ToolbarIcon>
        );
      })}
    </ToolbarWrapper>
  );
};

const ToolbarWrapper = styled.div`
  display: flex;
`;

const ToolbarIcon = styled.div`
  height: 1.6rem;
  width: 1.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
  cursor: pointer;
  background: ${(props: { selected: boolean }) =>
    props.selected ? 'lightblue' : 'none'}

  :hover {
    background: lightblue;
  }
`;
