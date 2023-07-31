import React from 'react';

import styled from 'styled-components/macro';

import { Tooltip } from '@cognite/cogs.js';

const NotificationIcon = styled.span`
  position: absolute;
  height: 5px;
  width: 5px;
  border-radius: 50%;
  background: #eb9b00;
`;

export const WellReportNotification: React.FC<{
  wellboreMatchingId: string;
  ongoingWellReportWellboreExternalIds: string[];
}> = ({
  wellboreMatchingId,
  ongoingWellReportWellboreExternalIds,
}: {
  wellboreMatchingId: string;
  ongoingWellReportWellboreExternalIds: string[];
}) => {
  const showNotificationIcon =
    ongoingWellReportWellboreExternalIds.includes(wellboreMatchingId);

  if (!showNotificationIcon) {
    return <></>;
  }

  return (
    <Tooltip content="Ongoing report">
      <NotificationIcon />
    </Tooltip>
  );
};
