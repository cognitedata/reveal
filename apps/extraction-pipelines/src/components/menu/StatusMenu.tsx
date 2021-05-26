import { StyledDropdown } from 'styles/StyledDropdown';
import { Badge, Button, Colors, Menu } from '@cognite/cogs.js';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import React, { PropsWithoutRef } from 'react';
import { Status } from 'model/Status';
import StatusMarker from 'components/integrations/cols/StatusMarker';
import styled from 'styled-components';

const StyledMenu = styled((props) => <Menu {...props}>{props.children}</Menu>)`
  .cogs-menu-item {
    .cogs-icon-Checkmark {
      svg {
        path {
          fill: ${Colors.primary.hex()};
        }
      }
    }
  }
`;

export interface StatusMenuProps {
  setSelected: (status?: Status) => void;
  selected: Status;
  btnType?: 'ghost' | 'tertiary';
}

export const StatusMenu = ({
  selected,
  setSelected,
  btnType = 'ghost',
}: StatusMenuProps) => {
  return (
    <StyledDropdown
      content={
        <StatusMenuContent setSelected={setSelected} selected={selected} />
      }
    >
      <Button type={btnType} icon="CaretDown" iconPlacement="right">
        {TableHeadings.STATUS}{' '}
        {selected === Status.NOT_ACTIVATED ? (
          '- ALL'
        ) : (
          <StatusMarker status={selected} dataTestId="status-menu-fail" />
        )}
      </Button>
    </StyledDropdown>
  );
};
const StatusMenuContent = ({
  selected,
  setSelected,
}: PropsWithoutRef<StatusMenuProps>) => {
  const onClick = (status?: Status) => {
    return () => setSelected(status);
  };
  return (
    <StyledMenu>
      <Menu.Item
        onClick={onClick(Status.FAIL)}
        selected={selected === Status.FAIL}
        appendIcon={selected === Status.FAIL ? 'Checkmark' : undefined}
        aria-selected={selected === Status.FAIL}
        data-testid="status-menu-fail"
      >
        <StatusMarker status={Status.FAIL} dataTestId="status-menu-fail" />
      </Menu.Item>
      <Menu.Item
        onClick={onClick(Status.OK)}
        selected={selected === Status.OK}
        appendIcon={selected === Status.OK ? 'Checkmark' : undefined}
        aria-selected={selected === Status.OK}
        data-testid="status-menu-ok"
      >
        <StatusMarker status={Status.OK} dataTestId="status-menu-ok" />
      </Menu.Item>
      <Menu.Item
        onClick={onClick()}
        selected={selected === Status.NOT_ACTIVATED}
        appendIcon={selected === Status.NOT_ACTIVATED ? 'Checkmark' : undefined}
        aria-selected={selected === Status.NOT_ACTIVATED}
        data-testid="status-menu-all"
      >
        <Badge
          text="ALL"
          background="white"
          aria-label="All"
          data-testid="status-menu-all"
        />
      </Menu.Item>
    </StyledMenu>
  );
};
