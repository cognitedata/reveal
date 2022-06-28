import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { Flex, FlexColumn, FlexRow, sizes } from 'styles/layout';

export const DetailCardWrapper = styled(FlexRow)`
  height: auto;
  width: fit-content;
  max-width: 360px;
  min-width: 360px;
  flex-wrap: wrap;
  padding: ${sizes.small};
  background: var(--cogs-white);
  border: 2px solid rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  box-shadow: 0px 8px 16px 4px rgba(0, 0, 0, 0.04),
    0px 2px 12px rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  gap: ${sizes.small};
  z-index: ${layers.MAXIMUM};
  align-items: center;
`;

export const DetailCardBlock = styled(FlexColumn)`
  padding: 8px 16px 8px 12px;
  background: var(--cogs-greyscale-grey1);
  border-radius: 8px;
  min-width: 130px;
  width: 80px;
  height: fit-content;
  ${(props: any) => props.flex && `flex: 1;`}
`;

export const DetailCardBlockHeader = styled(Flex)`
  font-weight: 500;
  font-size: var(--cogs-o1-font-size);
  line-height: var(--cogs-b2-line-height);
  letter-spacing: var(--cogs-b3-letter-spacing);
  color: var(--cogs-greyscale-grey9);
`;

export const DetailCardBlockContent = styled(Flex)`
  font-size: var(--cogs-b3-font-size);
  line-height: var(--cogs-b3-line-height);
  letter-spacing: -2.5e-5em;
  color: var(--cogs-greyscale-grey9);
`;

export const DetailCardColor = styled.div`
  background-color: ${(props: any) => props.color};
  min-width: 12px;
  min-height: 12px;
  max-width: 12px;
  max-height: 12px;
  border: 2px solid rgba(64, 64, 64, 0.04);
  border-radius: 4px;
`;

export const DetailCardMain = styled(FlexRow)`
  gap: 12px;
  align-items: center;
  flex: 1;
`;
