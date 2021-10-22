import styled from 'styled-components/macro';

import { Body, Tooltip, Menu } from '@cognite/cogs.js';

import layers from '_helpers/zindex';
import { Center, FlexColumn, sizes } from 'styles/layout';

import { BAR_HEIGHT, CHART_BACKGROUND_COLOR } from './constants';

export const StackedBarChartWrapper = styled.div`
  position: relative;
  height: calc(100% - 50px);
  background: ${CHART_BACKGROUND_COLOR};
  border-radius: ${sizes.small};
  padding: ${sizes.normal};
`;

export const ChartStickyElement = styled.svg`
  position: sticky;
  top: 0px;
  bottom: 0px;
  background: ${CHART_BACKGROUND_COLOR};
  z-index: ${layers.TABLE_HEADER};
`;

export const ChartDetailsContainer = styled(FlexColumn)`
  position: relative;
  text-align: center;
`;

export const ChartActionButtonsContainer = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  .cogs-btn {
    color: var(--cogs-greyscale-grey6);
    margin-right: ${sizes.small};
    :last-child {
      margin-right: 0px;
    }
  }
  .cogs-btn-disabled {
    background: transparent !important;
    color: var(--cogs-greyscale-grey5) !important;
  }
  .cogs-btn-disabled:hover {
    background: transparent;
    color: var(--cogs-greyscale-grey5);
  }
`;

export const ChartTitle = styled.span`
  color: var(--cogs-text-primary);
  font-size: ${sizes.normal};
  font-weight: 500;
`;

export const ChartSubtitle = styled.span`
  color: var(--cogs-text-hint);
  font-size: 10px;
`;

export const AxisLabel = styled(Body)`
  color: var(--cogs-text-hint) !important;
  font-size: 12px !important;
  font-weight: 500;
  margin-top: ${sizes.small};
  margin-bottom: -${sizes.small};
`;

export const ChartContainer = styled.div`
  overflow: scroll;
  margin-top: ${sizes.normal};
  margin-bottom: -${sizes.extraSmall};
  height: calc(100% - 75px);
  ${(props: { height: number; offsetbottom: number }) => `
    padding-bottom: ${props.offsetbottom}px;
  `}
  .domain {
    display: none;
  }
  .tick {
    line {
      color: var(--cogs-border-default);
    }
    text {
      color: var(--cogs-text-hint);
      font-size: 12px;
    }
  }
  .Axis-Left {
    display: none;
  }

  /* Scrollbar styles */

  ::-webkit-scrollbar {
    width: ${sizes.small};
    height: ${sizes.small};
  }
  ::-webkit-scrollbar-track {
    background: var(--cogs-greyscale-grey2);
  }
  ::-webkit-scrollbar-thumb {
    background: var(--cogs-greyscale-grey3);
    border-radius: ${sizes.small};
  }
  ::-webkit-scrollbar-thumb:hover {
    background: var(--cogs-greyscale-grey4);
  }
`;

export const ChartSVG = styled.svg``;

export const BarComponent = styled.foreignObject`
  padding-top: ${sizes.normal};
`;

export const BarLabel = styled(Body)`
  display: flex;
  align-items: center;
  color: var(--cogs-text-primary) !important;
  padding: ${sizes.extraSmall} ${sizes.small};
  margin-bottom: ${sizes.extraSmall};
  width: fit-content;
  transition: 0.3s all;
  cursor: default;
  i {
    margin-left: ${sizes.small};
  }
  ${(props: { disabled: boolean }) =>
    props.disabled
      ? `color: var(--cogs-text-secondary) !important;`
      : `
    cursor: pointer;
    :hover {
      opacity: 0.7 !important;
    }
  `}
`;

export const Bar = styled(Center)`
  position: absolute;
  align-items: center;
  height: ${BAR_HEIGHT}px;
  border-radius: ${sizes.extraSmall} 0px 0px ${sizes.extraSmall};
  border-width: 2px 0px;
  border-style: solid;
  border-color: ${CHART_BACKGROUND_COLOR};
  ${(props: {
    fill: string;
    width: number;
    rounded: boolean;
    disabled: boolean;
  }) => `
    background: ${props.fill};
    width: ${props.width}px;
    ${props.rounded && `border-radius: ${sizes.extraSmall}`};
    ${!props.disabled && `cursor: pointer`};
  `};
`;

export const BarText = styled(Body)`
  color: var(--cogs-text-secondary) !important;
  font-size: 13px !important;
  font-weight: 500;
  margin: ${sizes.extraSmall};
`;

export const BarTooltip = styled(Tooltip)`
  position: absolute;
  white-space: nowrap;
  text-align: center;
  top: ${BAR_HEIGHT}px;
  transform: translateX(-50%);
`;

export const ChartLegend = styled.div`
  flex-direction: row;
  width: fit-content;
  position: relative;
  ${(props: { floatingHeight?: number }) =>
    props.floatingHeight &&
    `
    position: absolute;
    bottom: ${props.floatingHeight}px;
  `}
  left: 50%;
  margin-top: ${sizes.medium};
  transform: translateX(-50%);
  color: var(--cogs-text-secondary);
  border-radius: ${sizes.small};

  .cogs-checkbox {
    font-size: 12px;
    font-weight: 500;
    margin-right: ${sizes.normal};
  }
  .cogs-checkbox:last-child {
    margin-right: 0px;
  }
`;

export const ChartLegendIsolated = styled(Menu)`
  padding: ${sizes.normal} !important;
`;

export const LegendTitle = styled.span`
  font-size: 13px;
  text-align: center;
  margin-bottom: 12px;
`;

export const ResetToDefaultContainer = styled(FlexColumn)`
  justify-content: center;
  align-items: center;
  height: calc(100% - 120px);
`;

export const EmptyStateContainer = styled.div`
  margin-bottom: 40px;
`;
