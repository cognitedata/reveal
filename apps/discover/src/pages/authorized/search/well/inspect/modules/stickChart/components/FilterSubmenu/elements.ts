import styled from 'styled-components/macro';

import { Menu } from '@cognite/cogs.js';

import { FlexColumn } from 'styles/layout';

export const SelectorContainer = styled(FlexColumn)`
  .cogs-body-2,
  .cogs-body-3 {
    align-self: flex-start;
  }
  .cogs-body-3 {
    color: var(--cogs-text-secondary);
  }
`;

export const OptionsContainer = styled(Menu)`
  width: 100px;
`;
