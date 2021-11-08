import styled from 'styled-components/macro';

import { Menu } from '@cognite/cogs.js';

import { sizes } from 'styles/layout';

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
