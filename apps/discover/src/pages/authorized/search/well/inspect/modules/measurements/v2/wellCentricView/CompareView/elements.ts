import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { Flex, FlexColumn, FlexRow, sizes } from 'styles/layout';

export const TopBar = styled(FlexRow)`
  position: sticky;
  top: 0;
  z-index: ${layers.FILTER_BOX};
  padding: 0 ${sizes.small};
  margin-top: ${sizes.normal};
`;

export const Header = styled(FlexRow)`
  height: 68px;
  background: #fafafa;
  box-shadow: inset 0px -1px 0px #e8e8e8;
  padding: ${sizes.normal};
`;

export const HeaderTitle = styled(Flex)`
  font-weight: 600;
  letter-spacing: var(--cogs-t5-letter-spacing);
  color: var(--cogs-greyscale-grey9);
  font-size: var(--cogs-t5-font-size);
  line-height: var(--cogs-t5-line-height);
`;

export const HeaderSubTitle = styled(Flex)`
  font-weight: 500;
  font-size: var(--cogs-detail-font-size);
  line-height: var(--cogs-o1-line-height);
  letter-spacing: var(--cogs-micro-letter-spacing);
  color: var(--cogs-greyscale-grey7);
  margin: ${sizes.extraSmall} 0px;
`;

export const CompareViewCardsWrapper = styled(FlexColumn)`
  height: calc(100% - 148px);
  gap: ${sizes.normal};
  overflow: auto;
  margin-top: ${sizes.normal};
  padding: 0 ${sizes.normal};
`;

export const CardWrapper = styled(FlexColumn)`
  background: var(--cogs-greyscale-grey1);
  border-radius: 8px;
`;

export const Footer = styled(FlexColumn)`
  padding: ${sizes.normal};
  padding-top: 0;
  align-items: center;
  gap: ${sizes.normal};
`;

export const LegendsHolder = styled(Flex)`
  gap: ${sizes.normal};
  flex-wrap: wrap;
  justify-content: center;
  overflow: hidden;
  height: ${(props: { expanded: boolean }) =>
    props.expanded ? 'auto' : '32px'};
`;

export const CurveName = styled(Flex)`
  margin-left: 5px;
  font-weight: 500;
  font-size: var(--cogs-detail-font-size);
  line-height: var(--cogs-detail-line-height);
  letter-spacing: var(--cogs-micro-letter-spacing);
  color: var(--cogs-greyscale-grey7);
`;

export const WellboreName = styled(Flex)`
  margin-left: 5px;
  margin-top: 2px;
  font-weight: 500;
  font-size: 10px;
  line-height: 14px;
  letter-spacing: var(--cogs-micro-letter-spacing);
  color: var(--cogs-greyscale-grey6);
`;
