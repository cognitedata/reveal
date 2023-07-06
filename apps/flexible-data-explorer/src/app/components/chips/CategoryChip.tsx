import React from 'react';

import styled from 'styled-components';

import { Chip } from '@cognite/cogs.js';

export const CategoryChip: React.FC<React.ComponentProps<typeof Chip>> = (
  props
) => {
  return <StyledChip {...props} />;
};

const StyledChip = styled(Chip)`
  color: var(--cogs-border--status-neutral--strong) !important;
  background-color: #ebeef78f !important;
`;
