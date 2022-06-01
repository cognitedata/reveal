import styled from 'styled-components/macro';

import { sizes, Flex } from 'styles/layout';

export const NdsControlWrapper = styled(Flex)`
  width: 100%;
  margin-bottom: ${sizes.normal};
`;

export const WellboreTableWrapper = styled.div`
  max-height: 75vh;
  overflow: auto;
`;
