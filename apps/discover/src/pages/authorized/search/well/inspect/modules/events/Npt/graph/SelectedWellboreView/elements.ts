import styled from 'styled-components/macro';

import { Body } from '@cognite/cogs.js';

import { FlexColumn, FlexRow, sizes } from 'styles/layout';

export const NavigationPanelContainer = styled(FlexRow)`
  background: var(--cogs-bg-accent);
  padding: ${sizes.normal};
  align-items: center;
`;

export const DetailsContainer = styled(FlexColumn)`
  margin-left: ${sizes.small};
  width: 100%;
`;

export const WellboreName = styled(Body)`
  font-weight: 600;
  font-size: 16px;
  color: var(--cogs-text-primary);
`;

export const WellName = styled(Body)`
  font-weight: 500;
  font-size: 12px;
  color: var(--cogs-text-hint);
`;

export const NPTDurationGraphWrapper = styled.div`
  margin: ${sizes.normal};
  .stacked-bar-chart {
    padding: ${sizes.large} ${sizes.normal};
    .chart-details {
      margin-bottom: ${sizes.medium};
    }
    .chart-legend {
      margin-top: ${sizes.large} !important;
    }
  }
`;

export const NPTEventsTableWrapper = styled.div`
  table {
    margin: ${sizes.normal};
  }
  td:empty {
    color: var(--cogs-greyscale-grey5);

    &:after {
      content: '\u2014';
    }
  }
`;
