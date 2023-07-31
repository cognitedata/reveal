import styled from 'styled-components/macro';

import { Flex, FlexColumn, sizes } from 'styles/layout';

export const WellCentricViewCardWrapper = styled(FlexColumn)`
  width: 100%;
  background: var(--cogs-bg-accent);
  border-radius: 12px;
`;

export const ContentWrapper = styled(Flex)`
  width: 100%;
  padding: ${sizes.small};
  justify-content: center;
`;

export const ChartLegendWrapper = styled(FlexColumn)`
  width: calc(100% - 360px); // width of events columns + padding
`;
