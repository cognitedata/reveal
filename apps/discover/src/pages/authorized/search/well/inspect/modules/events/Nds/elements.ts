import styled from 'styled-components/macro';

import { Row } from '@cognite/cogs.js';

import { Flex } from 'styles/layout';

export const NdsFilterContainer = styled.div`
  width: 100%;
  height: 100%;
`;

export const NdsFilterRow = styled(Row)`
  margin-bottom: 8px;
  height: 100%;
`;

export const NdsFilterItemWrapper = styled.div`
  width: 100%;
  height: 100%;
  margin-top: 0px;
`;

export const NdsFooter = styled(Flex)`
  border-top: solid 1px var(--cogs-border-default);
  margin-top: 8px;
  justify-content: center;
  height: 52px;
  align-items: center;
`;
