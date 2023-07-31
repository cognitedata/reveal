import styled from 'styled-components/macro';

import { Body, Tooltip } from '@cognite/cogs.js';

import { CHART_BACKGROUND_COLOR } from 'components/Charts/constants';
import { Center, sizes } from 'styles/layout';

import { BAR_HEIGHT } from './constants';

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
  border-width: 2px 0px;
  border-style: solid;
  border-color: ${CHART_BACKGROUND_COLOR};
  box-shadow: inset -2px 0px 0px rgba(0, 0, 0, 0.04);
  cursor: pointer;
`;

export const BarDisabled = styled(Bar)`
  cursor: default;
  border-radius: ${sizes.extraSmall};
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
  text-align: left;
  top: ${BAR_HEIGHT}px;
  transform: translateX(-50%);
`;
