import styled from 'styled-components/macro';

import { Button, Flex } from '@cognite/cogs.js';

import { MarginBottomNormalContainer, sizes } from 'styles/layout';

export const WellboreRow = styled(Flex)`
  height: 36px;
  border-radius: 4px;
  background-color: var(--cogs-greyscale-grey2);
  margin-bottom: ${sizes.extraSmall};
`;

export const WellboreTitle = styled.div`
  flex: 1;
  padding: ${sizes.small};
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;
  color: var(--cogs-greyscale-grey9);
  &:hover {
    cursor: pointer;
  }
`;

export const WellboreButton = styled(Button)`
  color: var(--cogs-greyscale-grey6);
`;

export const WellMetaDataContainer = styled(MarginBottomNormalContainer)`
  margin-top: ${sizes.normal};
`;
