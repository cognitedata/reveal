import styled from 'styled-components/macro';

import { Menu } from '@cognite/cogs.js';

import { sizes } from 'styles/layout';

export const ChartLegend = styled.div`
  flex-direction: row;
  width: fit-content;
  max-width: 100%;
  position: relative;
  left: 50%;
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
  overflow: auto;
`;

export const LegendTitle = styled.span`
  font-size: 13px;
  text-align: center;
  margin-bottom: 12px;
`;
