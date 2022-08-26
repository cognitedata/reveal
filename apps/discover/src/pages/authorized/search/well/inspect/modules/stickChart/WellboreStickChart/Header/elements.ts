import styled from 'styled-components/macro';

import { Flex, FlexRow, sizes } from 'styles/layout';

export const HeaderWrapper = styled(FlexRow)`
  padding: ${sizes.normal};
  box-shadow: inset 0px -1px 0px var(--cogs-greyscale-grey3);
  gap: 8px;
`;

export const Title = styled(Flex)`
  width: 100%;
  font-weight: 600;
  font-size: ${sizes.normal};
  line-height: 20px;
  align-items: center;
  letter-spacing: -0.01em;
  color: var(--cogs-greyscale-grey9);
`;

export const Subtitle = styled(Flex)`
  width: 100%;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  align-items: center;
  letter-spacing: -0.004em;
  color: rgba(0, 0, 0, 0.45);
  margin-top: ${sizes.extraSmall};
`;

export const SegmentedControlStyler = styled.div`
  & > *.cogs-segmented-control.default {
    background: rgba(83, 88, 127, 0.08) !important;
    height: 90% !important;
  ]
`;
