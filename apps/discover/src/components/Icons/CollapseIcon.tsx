import * as React from 'react';

import styled from 'styled-components/macro';

import { CollapsePanelProps, Icon } from '@cognite/cogs.js';

const StyledCollapseIcon = styled(Icon)`
  margin-right: 8px;
  color: var(--cogs-text-color-secondary);
  transition: transform 0.2s;
  transform: ${({ active }: { active: string }) =>
    JSON.parse(active) ? 'rotate(-180deg)' : 'rotate(0deg)'};
`;

export const CollapseIcon: React.FC<CollapsePanelProps> = ({ isActive }) => {
  return (
    <StyledCollapseIcon type="ChevronDown" active={`${isActive}`} /> // note: active is string?!?!
  );
};
