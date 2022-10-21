import styled from 'styled-components/macro';

import { Label } from '@cognite/cogs.js';

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
`;

export const HeaderData = styled(FlexRow)`
  margin-top: ${sizes.extraSmall};
  width: fit-content;
  gap: ${sizes.small};
`;

export const HeaderLabel = styled(Label)`
  font-size: 12px;
  line-height: ${sizes.normal};
  padding: 2px 6px;
  border-radius: ${sizes.extraSmall};
`;
