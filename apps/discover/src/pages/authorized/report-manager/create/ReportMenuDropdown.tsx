import { Button, Dropdown } from '@cognite/cogs.js';

import { WellReportMenu, WellReportMenuProps } from './WellReportMenu';

export const ReportMenuDropdown = ({
  wellboreMatchingId,
  dataSet,
}: WellReportMenuProps) => {
  return (
    <Dropdown
      content={
        <WellReportMenu
          wellboreMatchingId={wellboreMatchingId}
          dataSet={dataSet}
        />
      }
    >
      <Button
        key="CreateReportButton"
        type="ghost"
        aria-label="Create Report Button"
        icon="EllipsisVertical"
      />
    </Dropdown>
  );
};
