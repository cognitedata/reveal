import { StyledDropdown } from 'components/styled';
import { Badge, Button, Colors, Menu } from '@cognite/cogs.js';
import React, { PropsWithoutRef } from 'react';
import { RunStatusUI } from 'model/Status';
import StatusMarker from 'components/extpipes/cols/StatusMarker';
import styled from 'styled-components';
import { useTranslation } from 'common';
export interface StatusMenuProps {
  setSelected: (status?: RunStatusUI) => void;
  selected: RunStatusUI;
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
        {selected === RunStatusUI.NOT_ACTIVATED ? (
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
  const onClick = (status?: RunStatusUI) => {
    return () => setSelected(status);
  };
  return (
    <StyledMenu>
      <Menu.Item
        onClick={onClick(RunStatusUI.FAILURE)}
        selected={selected === RunStatusUI.FAILURE}
        appendIcon={selected === RunStatusUI.FAILURE ? 'Checkmark' : undefined}
        aria-selected={selected === RunStatusUI.FAILURE}
        data-testid="status-menu-item-fail"
      >
        <StatusMarker
          status={RunStatusUI.FAILURE}
          dataTestId="status-menu-fail"
        />
      </Menu.Item>
      <Menu.Item
        onClick={onClick(RunStatusUI.SUCCESS)}
        selected={selected === RunStatusUI.SUCCESS}
        appendIcon={selected === RunStatusUI.SUCCESS ? 'Checkmark' : undefined}
        aria-selected={selected === RunStatusUI.SUCCESS}
        data-testid="status-menu-item-ok"
      >
        <StatusMarker
          status={RunStatusUI.SUCCESS}
          dataTestId="status-menu-ok"
        />
      </Menu.Item>
      <Menu.Item
        onClick={onClick()}
        selected={selected === RunStatusUI.NOT_ACTIVATED}
        appendIcon={
          selected === RunStatusUI.NOT_ACTIVATED ? 'Checkmark' : undefined
        }
        aria-selected={selected === RunStatusUI.NOT_ACTIVATED}
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
