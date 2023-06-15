import React, { PropsWithoutRef } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@extraction-pipelines/common';
import StatusMarker from '@extraction-pipelines/components/extpipes/cols/StatusMarker';
import { StyledDropdown } from '@extraction-pipelines/components/styled';
import { RunStatus } from '@extraction-pipelines/model/Runs';

import { Button, Chip, Colors, Menu } from '@cognite/cogs.js';
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
        icon={selected === 'failure' ? 'Checkmark' : undefined}
        aria-selected={selected === 'failure'}
        data-testid="status-menu-item-fail"
      >
        <StatusMarker status="failure" dataTestId="status-menu-fail" />
      </Menu.Item>
      <Menu.Item
        onClick={onClick('success')}
        icon={selected === 'success' ? 'Checkmark' : undefined}
        aria-selected={selected === 'success'}
        data-testid="status-menu-item-ok"
      >
        <StatusMarker status="success" dataTestId="status-menu-ok" />
      </Menu.Item>
      <Menu.Item
        onClick={onClick()}
        icon={!selected ? 'Checkmark' : undefined}
        aria-selected={!selected}
        data-testid="status-menu-item-all"
      >
        <Chip
          size="x-small"
          label={t('all')}
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
          fill: ${Colors['text-icon--interactive--default']};
        }
      }
    }
  }
`;
