import styled from 'styled-components/macro';

import { Body } from '@cognite/cogs.js';

import { FlexColumn, FlexRow, sizes } from 'styles/layout';

import { CHART_BACKGROUND_COLOR } from './constants';

export const ChartWrapper = styled.div`
  position: relative;
  height: calc(100% - 50px);
  background: ${CHART_BACKGROUND_COLOR};
  border-radius: ${sizes.small};
  padding: ${sizes.normal};
`;

export const ChartDetailsContainer = styled(FlexColumn)`
  position: relative;
  text-align: center;
`;

export const AxisLabel = styled(Body)`
  color: var(--cogs-text-hint) !important;
  font-size: 12px !important;
  font-weight: 500;
`;

export const ChartWithYAxisTitle = styled(FlexRow)`
  height: 100%;
`;

export const ChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: scroll;
  margin-top: ${sizes.normal};
  margin-bottom: -${sizes.extraSmall};
  height: calc(100% - 75px);
  ${(props: { offsetbottom: number }) => `
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
