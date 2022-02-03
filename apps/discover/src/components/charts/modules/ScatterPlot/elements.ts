import styled from 'styled-components/macro';

import { Tooltip } from '@cognite/cogs.js';

import { CHART_BACKGROUND_COLOR } from 'components/charts/constants';
import { sizes } from 'styles/layout';

import { PLOT_BORDER_SIZE, PLOT_SIZE } from './constants';

export const PlotContainer = styled.foreignObject`
  height: ${PLOT_SIZE}px;
  width: ${PLOT_SIZE}px;
  transform: translate(-${PLOT_SIZE / 2}px, -${PLOT_SIZE / 2}px);
`;

export const Plot = styled.div`
  height: 100%;
  width: 100%;
  background: ${(props: { color: string }) => props.color};
  border: ${PLOT_BORDER_SIZE}px solid ${CHART_BACKGROUND_COLOR};
  border-radius: ${sizes.extraSmall};
  cursor: pointer;
`;

export const PlotTooltip = styled(Tooltip)`
  transform: translateY(${PLOT_BORDER_SIZE}px);
`;
