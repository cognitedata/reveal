import styled from 'styled-components/macro';

import { Flex, FlexRow, sizes } from 'styles/layout';

export const TopBarWrapper = styled(FlexRow)`
  margin-bottom: ${sizes.normal};
  align-items: center;
`;

export const SearchBoxWrapper = styled(Flex)`
  width: auto;
`;
