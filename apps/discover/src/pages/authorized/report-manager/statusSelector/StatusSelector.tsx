import { REPORT_STATUS } from 'domain/reportManager/internal/constants';
import { Report, DisplayReport } from 'domain/reportManager/internal/types';

import map from 'lodash/map';
import styled from 'styled-components/macro';

import { Button, LabelProps } from '@cognite/cogs.js';

import { Dropdown } from 'components/Dropdown';

import { UpdateReport } from '../types';

import { StatusLabel } from './StatusLabel';

const DropdownContainer = styled.div`
  button.dropdown-value {
    height: 28px;
    font-size: 12px;
  }
  cursor: pointer;
`;
const DropdownContainerBacklog = styled(DropdownContainer)`
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

const containers: Record<DisplayReport['status'], any> = {
  Backlog: DropdownContainerBacklog,
  Resolved: DropdownContainerResolved,
  'In progress': DropdownContainerInProgress,
  Dismissed: DropdownContainerDismissed,
};

const LABEL_VARIANTS: Record<DisplayReport['status'], LabelProps['variant']> = {
  Backlog: 'normal',
  Resolved: 'success',
  'In progress': 'warning',
  Dismissed: 'unknown',
};

const StatusDropdownMenu = ({
  handleDropdownSelect,
}: {
  handleDropdownSelect: (status: Report['status']) => void;
}) => {
  return (
    <Dropdown.Menu>
      {map<typeof REPORT_STATUS>(
        REPORT_STATUS,
        (statusLabel: string, statusValue: Report['status']) => (
          <Dropdown.Item
            key={`report-status-${statusValue}`}
            onClick={() => handleDropdownSelect(statusValue)}
          >
            {statusLabel}
          </Dropdown.Item>
        )
      )}
    </Dropdown.Menu>
  );
};

export const StatusSelector = ({
  id,
  value,
  onReportUpdate,
  isAdmin,
}: {
  id: DisplayReport['id'];
  value: DisplayReport['status'];
  onReportUpdate: UpdateReport;
  isAdmin?: boolean;
}) => {
  const handleDropdownSelect = (newState: Report['status']) => {
    onReportUpdate({ report: { status: newState }, id });
  };

  const StyledContainer = containers[value];
  if (!StyledContainer) {
    return <>Error: {value}</>;
  }

  if (isAdmin) {
    return (
      <StyledContainer>
        <Dropdown
          content={
            <StatusDropdownMenu handleDropdownSelect={handleDropdownSelect} />
          }
        >
          <Button
            icon="ChevronDown"
            iconPlacement="right"
            className="dropdown-value"
          >
            <>{value}</>
          </Button>
        </Dropdown>
      </StyledContainer>
    );
  }

  return <StatusLabel value={value} variant={LABEL_VARIANTS[value]} />;
};
