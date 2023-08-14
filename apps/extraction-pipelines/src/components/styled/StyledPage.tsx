import styled from 'styled-components';

import { Colors, Flex } from '@cognite/cogs.js';

export const PAGE_MARGIN = '1.5rem';

export const PageWrapperColumn = styled(Flex)`
  padding: 24px;
  min-height: calc(100vh - 15rem);
  flex-direction: column;
  gap: 1rem;
`;

export const StyledPageContainer = styled.div`
  background-color: ${Colors['surface--muted']};
  min-height: calc(100vh - 56px);
  height: 100%;
`;
