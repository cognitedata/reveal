import styled from 'styled-components/macro';

import { Flex, FlexColumn, FlexRow, sizes } from 'styles/layout';

export const WellboreStickChartWrapper = styled(FlexColumn)`
  height: 100%;
  width: fit-content;
  background: var(--cogs-bg-accent);
  border-radius: 12px;
  margin-right: ${sizes.normal} !important;
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

export const NptEventAvatar = styled.div`
  height: 12px;
  width: 12px;
  border-radius: ${sizes.extraSmall};
  border: 2px var(--cogs-greyscale-grey2) solid;
  background-color: ${(props: { color: string }) => props.color};
  margin-top: -9px;
  margin-right: ${sizes.extraSmall};
  align-self: center;
  cursor: pointer;
`;

export const WellboreStickChartEmptyStateWrapper = styled(ContentWrapper)`
  margin-top: 25%;
`;
