import styled from 'styled-components/macro';

import { Center, Flex, sizes } from 'styles/layout';

export const CasingViewButtonWrapper = styled(Flex)`
  margin-right: 16px;

  & > * button {
    min-width: 110px;
    padding: 4px 8px !important;
  }
`;

export const CasingPreviewWrapper = styled(Center)`
  height: 100%;
  padding: ${sizes.normal};
`;
