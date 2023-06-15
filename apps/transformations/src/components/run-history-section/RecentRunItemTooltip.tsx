import styled from 'styled-components';

import { Job } from '@transformations/types';

import { Colors, Tooltip, Elevations } from '@cognite/cogs.js';

import RecentRunItemTooltipContent from './RecentRunItemTooltipContent';

type RecentRunItemTooltipProps = {
  children: React.ReactElement<any>;
  job: Job;
};

const RecentRunItemTooltip = ({
  children,
  job,
}: RecentRunItemTooltipProps): JSX.Element => {
  return (
    <StyledRecentRunItemTooltipWrapper
      content={<RecentRunItemTooltipContent job={job} />}
      position="bottom"
    >
      {children}
    </StyledRecentRunItemTooltipWrapper>
  );
};

const StyledRecentRunItemTooltipWrapper = styled(Tooltip)`
  && {
    background-color: ${Colors['surface--muted']};
    border-radius: 12px;
    box-shadow: ${Elevations['elevation--overlay']};

    .tippy-svg-arrow {
      fill: ${Colors['surface--muted']};
      stroke: ${Colors['surface--muted']};
    }
  }

  max-width: 370px !important; /* overrides cogs style */
  min-width: 200px;

  .tippy-content {
    background-color: ${Colors['surface--muted']};
    border-radius: 12px;
    padding: 0;
  }
`;

export default RecentRunItemTooltip;
