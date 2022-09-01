import styled from 'styled-components/macro';

import { Flex, FlexRow, sizes } from 'styles/layout';

export const HeaderWrapper = styled(FlexRow)`
  padding: ${sizes.small};
  box-shadow: inset 0px -1px 0px var(--cogs-greyscale-grey3);
  gap: 8px;
  align-items: center;
`;

export const WellName = styled(Flex)`
  width: 100%;
  font-weight: 500;
  font-size: 13px;
  line-height: 18px;
  align-items: center;
  letter-spacing: -0.003em;
  font-feature-settings: 'ss04' on;
  color: rgba(0, 0, 0, 0.7);
`;

export const WellboreName = styled(Flex)`
  width: 100%;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  align-items: center;
  letter-spacing: -0.006em;
  color: rgba(0, 0, 0, 0.9);
  margin-top: ${sizes.extraSmall};
`;

export const SegmentedControlStyler = styled.div`
  & > *.cogs-segmented-control.default {
    background: rgba(83, 88, 127, 0.08) !important;
  ]
`;
