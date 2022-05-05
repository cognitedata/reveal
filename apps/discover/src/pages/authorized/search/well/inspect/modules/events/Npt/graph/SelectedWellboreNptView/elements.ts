import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { Body } from '@cognite/cogs.js';

import { FlexColumn, FlexRow, sizes } from 'styles/layout';

export const NavigationPanelContainer = styled(FlexRow)`
  background: var(--cogs-bg-accent);
  padding: ${sizes.normal};
  margin-bottom: ${sizes.normal};
  align-items: center;
  z-index: ${layers.TOP_BAR};
`;

export const SelectedWellboreDataContainer = styled.div`
  overflow: auto;
  height: 100%;
  padding: ${sizes.normal};
  padding-top: 0;
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

export const ChartWrapper = styled.div`
  .stacked-bar-chart,
  .scatter-plot {
    padding: ${sizes.large} ${sizes.normal};
    .chart-details {
      margin-bottom: ${sizes.medium};
    }
    .chart-legend {
      margin-top: ${sizes.large} !important;
    }
  }
`;

export const Separator = styled.div`
  width: 56px;
  height: 2px;
  border-radius: ${sizes.extraSmall};
  background: var(--cogs-border-default);
  margin: ${sizes.normal};
  margin-left: calc(50% - 56px / 2);
`;

export const NPTEventsTableWrapper = styled.div`
  height: 100%;
  margin-top: ${sizes.normal};
  td:empty {
    color: var(--cogs-greyscale-grey5);

    &:after {
      content: '\u2014';
    }
  }
`;

export const NPTEventCard = styled.div`
  width: 648px;
`;

export const CardSection = styled(FlexColumn)`
  background: var(--cogs-bg-accent);
  padding: 12px;
  border-radius: ${sizes.small};
  width: 100%;
  height: 100%;
  margin: ${sizes.extraSmall} 0px;
  align-tems: center;
  :last-child {
    margin-bottom: 0px;
  }
`;

export const SectionTitle = styled(Body)`
  color: var(--cogs-text-primary);
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  margin-bottom: ${sizes.extraSmall};
`;

export const SectionData = styled(Body)`
  color: var(--cogs-text-primary);
  font-size: 13px;
  line-height: 18px;
  display: block;
  text-overflow: ellipsis;
  ${(props: { $multiline: boolean }) =>
    !props.$multiline &&
    `
    white-space: nowrap;
    overflow: hidden;
  `}
`;

export const NPTCodeIndicator = styled.div`
  width: 12px;
  height: 12px;
  border-radius: ${sizes.extraSmall};
  background: ${(props: { color: string }) => props.color};
  margin-right: 14px;
  align-self: center;
`;

export const NPTCodeContainer = styled(CardSection)`
  flex-direction: row;
  margin-bottom: 0px;
`;

export const CardColumn = styled(FlexColumn)`
  margin: ${sizes.extraSmall};
  :first-child {
    margin-left: 0px;
  }
  :last-child {
    margin-right: 0px;
  }
`;

export const QuarterColumn = styled(CardColumn)`
  width: 25%;
`;

export const HalfColumn = styled(CardColumn)`
  width: 50%;
`;

export const IconStyle = {
  marginLeft: '5px',
  verticalAlign: 'middle',
  color: 'rgba(0, 0, 0, 0.55)',
};
