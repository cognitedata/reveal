import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { Detail, Title } from '@cognite/cogs.js';

import { Flex, FlexColumn, FlexRow, sizes } from 'styles/layout';

export const WellCentricViewWrapper = styled(FlexColumn)`
  height: 100%;
  gap: ${sizes.normal};
  overflow: auto;
  visibility: ${(props: { visible: boolean }) =>
    props.visible ? 'visible' : 'hidden'};
`;

export const Wrapper = styled(FlexColumn)`
  background: var(--cogs-greyscale-grey1);
  border-radius: 8px;
`;

export const Header = styled(Flex)`
  padding: 14px ${sizes.normal};
  > * .checkbox-ui {
    margin-right: ${sizes.normal};
  }
  box-shadow: inset 0px -1px 0px #e8e8e8;
  width: 100%;
`;

export const HeaderTitleContainer = styled(FlexColumn)`
  gap: ${sizes.extraSmall};
`;

export const HeaderTitle = styled(Title).attrs({ level: '5' })``;

export const HeaderSubTitle = styled(Detail)``;

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
    props.expanded ? 'auto' : '16px'};
`;

export const CurveIndicator = styled(FlexRow)`
  span {
    margin-left: 5px;
    font-weight: 500;
    font-size: var(--cogs-detail-font-size);
    line-height: var(--cogs-detail-line-height);
    letter-spacing: var(--cogs-micro-letter-spacing);
    color: var(--cogs-greyscale-grey7);
  }
`;

export const BulkActionsWrapper = styled.div`
  position: relative;
  z-index: ${layers.BULK_ACTION};
  > * {
    &:first-child {
      margin: 0;
      width: 100%;
    }
  }
`;

export const Content = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px 16px;
`;
