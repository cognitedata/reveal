import styled from 'styled-components/macro';

import { Flex, FlexColumn, sizes } from 'styles/layout';

export const WellboreCasingsViewWrapper = styled(FlexColumn)`
  height: 100%;
  width: fit-content;
  background: var(--cogs-bg-accent);
  border-radius: 12px;
`;

export const ContentWrapper = styled(Flex)`
  height: calc(100% - 72px);
  padding: ${sizes.normal};
  gap: ${sizes.small};
  justify-content: center;
  > * h6 {
    display: none;
  }
`;
