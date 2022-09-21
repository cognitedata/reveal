import styled from 'styled-components/macro';

import { Button, Dropdown } from '@cognite/cogs.js';

import { WellReportMenu, WellReportMenuProps } from './WellReportMenu';

const DropdownContainer = styled.div`
  margin-right: 8px;
`;

export const WellReportButtonMenu = ({
  wellboreMatchingId,
  dataSet,
}: WellReportMenuProps) => {
  return (
    <DropdownContainer>
      <Dropdown
        placement="left"
        content={
          <WellReportMenu
            wellboreMatchingId={wellboreMatchingId}
            dataSet={dataSet}
          />
        }
      >
        <Button
          key="ReportIssue"
          type="secondary"
          aria-label="Report Issue Button"
        >
          <div>Report Issue</div>
        </Button>
      </Dropdown>
    </DropdownContainer>
  );
};
