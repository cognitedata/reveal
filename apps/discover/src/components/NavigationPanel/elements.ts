import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { Body } from '@cognite/cogs.js';

import { FlexColumn, FlexRow, sizes } from 'styles/layout';

export const DetailsContainer = styled(FlexColumn)`
  margin-left: ${sizes.small};
  width: 100%;
`;

export const NavigationPanelContainer = styled(FlexRow)`
  background: var(--cogs-bg-accent);
  padding: ${sizes.normal};
  align-items: center;
  z-index: ${layers.TOP_BAR};
`;

export const Title = styled(Body)`
  font-weight: 600;
  font-size: 16px;
  color: var(--cogs-text-primary);
`;

export const Subtitle = styled(Body)`
  font-weight: 500;
  font-size: 12px;
  color: var(--cogs-text-hint);
`;
