import styled from 'styled-components/macro';

import { FlexColumn, FlexRow, sizes } from 'styles/layout';

export const ContentWrapper = styled(FlexColumn)`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: ${sizes.normal};
  padding-top: 0;
  gap: ${sizes.normal};
`;

export const TopContentWrapper = styled(FlexRow)`
  padding: ${sizes.normal};
`;

export const ChartWrapper = styled(FlexColumn)`
  width: 100%;
  background: var(--cogs-bg-accent);
  border-radius: 12px;
  gap: ${sizes.normal};
`;
