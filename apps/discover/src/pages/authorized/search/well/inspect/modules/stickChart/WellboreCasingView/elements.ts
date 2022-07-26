import styled from 'styled-components/macro';

import { Flex, FlexColumn, FlexRow, sizes } from 'styles/layout';

export const WellboreCasingsViewWrapper = styled(FlexColumn)`
  height: 100%;
  width: fit-content;
  background: var(--cogs-bg-accent);
  border-radius: 12px;
`;

export const ContentWrapper = styled(Flex)`
  height: 100%;
  padding: ${sizes.small};
  justify-content: center;
  overflow: hidden;
`;

export const ColumnHeaderWrapper = styled(FlexRow)`
  height: 32px;
  padding: ${sizes.small};
  background: var(--cogs-greyscale-grey2);
  border-bottom: 1px solid var(--cogs-greyscale-grey3);
`;
