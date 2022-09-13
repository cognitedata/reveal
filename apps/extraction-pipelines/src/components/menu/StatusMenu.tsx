import { StyledDropdown } from 'components/styled';
import { Badge, Button, Colors, Menu } from '@cognite/cogs.js';
import React, { PropsWithoutRef } from 'react';
import StatusMarker from 'components/extpipes/cols/StatusMarker';
import styled from 'styled-components';
import { useTranslation } from 'common';
import { RunStatus } from 'model/Runs';
export interface StatusMenuProps {
  setSelected: (status?: RunStatus) => void;
  selected?: RunStatus;
  btnType?: 'ghost' | 'tertiary';
}

export const StatusMenu = ({
  selected,
  setSelected,
  btnType = 'ghost',
}: StatusMenuProps) => {
  const { t } = useTranslation();

  return (
    <StyledDropdown
      content={
        <StatusMenuContent setSelected={setSelected} selected={selected} />
      }
    >
      <Button
        type={btnType}
        icon="CaretDown"
        iconPlacement="right"
        data-testid="status-menu-button"
      >
        {t('last-run-status')}{' '}
        {!selected ? (
          `- ${t('all')}`
        ) : (
          <StatusMarker
            status={selected}
            dataTestId="status-menu-button-marker"
          />
        )}
      </Button>
    </StyledDropdown>
  );
};
const StatusMenuContent = ({
  selected,
  setSelected,
}: PropsWithoutRef<StatusMenuProps>) => {
  const { t } = useTranslation();
  const onClick = (status?: RunStatus) => {
    return () => setSelected(status);
  };
  return (
    <StyledMenu>
      <Menu.Item
        onClick={onClick('failure')}
        selected={selected === 'failure'}
        appendIcon={selected === 'failure' ? 'Checkmark' : undefined}
        aria-selected={selected === 'failure'}
        data-testid="status-menu-item-fail"
      >
        <StatusMarker status={'failure'} dataTestId="status-menu-fail" />
      </Menu.Item>
      <Menu.Item
        onClick={onClick('success')}
        selected={selected === 'success'}
        appendIcon={selected === 'success' ? 'Checkmark' : undefined}
        aria-selected={selected === 'success'}
        data-testid="status-menu-item-ok"
      >
        <StatusMarker status={'success'} dataTestId="status-menu-ok" />
      </Menu.Item>
      <Menu.Item
        onClick={onClick()}
        selected={!selected}
        appendIcon={!selected ? 'Checkmark' : undefined}
        aria-selected={!selected}
        data-testid="status-menu-item-all"
      >
        <Badge
          text={t('all')}
          background="white"
          aria-label="All"
          data-testid="status-menu-item-all"
        />
      </Menu.Item>
    </StyledMenu>
  );
};

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
