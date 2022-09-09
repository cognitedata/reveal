import styled from 'styled-components/macro';

import { Flex, Body, Detail } from '@cognite/cogs.js';

export const ReportMenuItemWrapper = styled(Flex)`
  flex: 1 1 0;
`;

export const ReportMenuItemBody = styled(Body)`
  text-align: left;
`;
export const ReportMenuItemDetail = styled(Detail)`
  text-align: left;
  color: var(--cogs-text-icon--muted);
`;
