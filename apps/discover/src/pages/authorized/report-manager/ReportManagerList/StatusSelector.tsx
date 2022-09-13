import { Report } from 'domain/reportManager/internal/types';

import * as React from 'react';

import capitalize from 'lodash/capitalize';
import styled from 'styled-components/macro';

import { Button } from '@cognite/cogs.js';

import { Dropdown } from 'components/Dropdown';

import { StatusLabel } from './StatusLabel';
import { UpdateReport } from './types';

const DropdownContainer = styled.div`
  button.dropdown-value {
    height: 28px;
    font-size: 12px;
  }
  cursor: pointer;
`;
const DropdownContainerActive = styled(DropdownContainer)`
  button.dropdown-value {
    color: var(--cogs-text-icon--status-neutral);
    background: var(--cogs-border--status-neutral--muted);
  }
`;
const DropdownContainerResolved = styled(DropdownContainer)`
  button.dropdown-value {
    color: var(--cogs-text-icon--status-success);
    background: var(--cogs-border--status-success--muted);
  }
`;
const DropdownContainerInProgress = styled(DropdownContainer)`
  button.dropdown-value {
    color: var(--cogs-text-icon--status-warning);
    background: var(--cogs-border--status-warning--muted);
  }
`;
const DropdownContainerDismissed = styled(DropdownContainer)`
  button.dropdown-value {
    color: var(--cogs-text-icon--status-undefined);
    background: var(--cogs-border--status-undefined--muted);
  }
`;

export const StatusSelector = ({
  id,
  value,
  onReportUpdate,
  isAdmin,
}: {
  id: Report['id'];
  value: Report['status'];
  onReportUpdate: UpdateReport;
  isAdmin?: boolean;
}) => {
  const handleDropdownSelect = (newState: Report['status']) => {
    onReportUpdate({ status: newState }, id);
  };

  const availableStates: Report['status'][] = [
    'ACTIVE',
    'RESOLVED',
    'IN_PROGRESS',
    'DISMISSED',
  ];

  const getDisplayValue = (value: Report['status']) =>
    capitalize(value).replace('_', ' ');

  const containers: Record<Report['status'], any> = {
    ACTIVE: DropdownContainerActive,
    RESOLVED: DropdownContainerResolved,
    IN_PROGRESS: DropdownContainerInProgress,
    DISMISSED: DropdownContainerDismissed,
  };

  const StyledContainer = containers[value];

  if (isAdmin) {
    return (
      <StyledContainer>
        <Dropdown
          content={
            <Dropdown.Menu>
              {availableStates.map((state) => (
                <Dropdown.Item
                  key={`report-state-${state}`}
                  onClick={() => handleDropdownSelect(state)}
                >
                  {getDisplayValue(state)}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          }
        >
          <Button
            icon="ChevronDown"
            iconPlacement="right"
            className="dropdown-value"
          >
            <>{getDisplayValue(value)}</>
          </Button>
        </Dropdown>
      </StyledContainer>
    );
  }

  return <StatusLabel value={getDisplayValue(value)} />;
};
