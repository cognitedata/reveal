import { Button, Dropdown } from '@cognite/cogs.js';

import { HoverContentWrapper } from './elements';
import { WellReportMenu, WellReportMenuProps } from './WellReportMenu';

export const WellReportThreeDotsMenu = ({
  wellboreMatchingId,
  dataSet,
}: WellReportMenuProps) => {
  return (
    <HoverContentWrapper>
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
    </HoverContentWrapper>
  );
};
