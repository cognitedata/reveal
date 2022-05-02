import styled from 'styled-components/macro';

import { Body } from '@cognite/cogs.js';

import { FlexColumn, sizes } from 'styles/layout';

import { FlexRow } from '../../styles/layout';

import {
  AXIS_LABEL_FONT_SIZE,
  AXIS_TITLE_FONT_SIZE,
  CHART_BACKGROUND_COLOR,
} from './constants';

export const ChartWrapper = styled(FlexColumn)`
  height: 100%;
  background: ${CHART_BACKGROUND_COLOR};
  border-radius: ${sizes.small};
  padding: ${sizes.normal};

  /* Chart styles */

  .domain {
    display: none;
  }
  .tick {
    line {
      color: var(--cogs-border-default);
    }
    text {
      color: var(--cogs-text-hint);
      font-size: ${AXIS_LABEL_FONT_SIZE}px;
    }
  }
`;

export const ChartDetailsContainer = styled(FlexColumn)`
  position: relative;
  text-align: center;
`;

export const ChartContentWrapper = styled(FlexColumn)`
  height: 100%;
`;

export const ChartRowContent = styled(FlexRow)`
  height: 100%;
`;

export const AxisLabel = styled(Body)`
  color: var(--cogs-text-hint) !important;
  font-size: ${AXIS_TITLE_FONT_SIZE}px !important;
  font-weight: 500;
`;

export const ChartWithXAxis = styled.div`
  width: 100%;
  overflow: auto;
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
