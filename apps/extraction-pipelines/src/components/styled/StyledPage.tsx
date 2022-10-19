import { Flex } from '@cognite/cogs.js';
import styled from 'styled-components';

export const PAGE_MARGIN = '1.5rem';

export const PageWrapperColumn = styled(Flex)`
  padding: ${PAGE_MARGIN};
  min-height: calc(100vh - 15rem);
  flex-direction: column;
  gap: 1rem;
`;
