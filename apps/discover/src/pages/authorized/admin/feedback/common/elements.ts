import styled from 'styled-components/macro';

import { Menu } from '@cognite/cogs.js';

export const ActionContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

export const AssignToDropdown = styled(Menu)`
  width: 156px;
`;

export const UnassignWarningMessage = styled.div`
  color: var(--cogs-text-primary);
`;
