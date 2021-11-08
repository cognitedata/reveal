import styled from 'styled-components/macro';

import { Body } from '@cognite/cogs.js';

import layers from '_helpers/zindex';
import { FlexColumn, sizes } from 'styles/layout';

import { CHART_BACKGROUND_COLOR } from './constants';

export const ChartWrapper = styled.div`
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
