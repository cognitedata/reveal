import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { Body } from '@cognite/cogs.js';

import { Flex, FlexRow, sizes } from 'styles/layout';

export const DetailsContainer = styled(Flex)`
  margin-left: ${sizes.small};
  flex-direction: column;
`;

export const NavigationPanelContainer = styled(FlexRow)`
  padding: ${sizes.normal};
  align-items: center;
  z-index: ${layers.TOP_BAR};
  border-bottom: 1px solid var(--cogs-border-default);
  background: var(--cogs-bg-accent);
  justify-content: space-between;
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
