import styled from 'styled-components/macro';

import { SubTitleText } from 'components/EmptyState/elements';
import { Flex, FlexColumn, FlexRow, sizes } from 'styles/layout';

import {
  SCALE_BLOCK_HEIGHT,
  SCALE_BOTTOM_PADDING,
  SCALE_PADDING,
} from './constants';

export const CasingViewListWrapper = styled.div`
  height: calc(100% - 4px);
  white-space: nowrap;
`;

export const CenterLine = styled.div`
  display: inline-block;
  width: 20px;
  height: 100%;
`;

export const Wrapper = styled(FlexColumn)`
  height: 100%;
  width: fit-content;
  background: var(--cogs-bg-accent);
  border-radius: 12px;
`;

export const Header = styled(FlexRow)`
  gap: 32px;
  padding: ${sizes.normal};
  box-shadow: inset 0px -1px 0px var(--cogs-greyscale-grey3);
`;

export const MainHeader = styled(Flex)`
  width: 100%;
  font-weight: 600;
  font-size: ${sizes.normal};
  line-height: 20px;
  align-items: center;
  letter-spacing: -0.01em;
  color: var(--cogs-greyscale-grey9);
`;

export const SubHeader = styled(Flex)`
  width: 100%;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  align-items: center;
  letter-spacing: -0.004em;
  color: rgba(0, 0, 0, 0.45);
  margin-top: ${sizes.extraSmall};
`;

export const BodyWrapper = styled(Flex)`
  height: calc(100% - 72px);
  padding: ${sizes.normal};
  gap: ${sizes.small};
  justify-content: center;
  > * h6 {
    display: none;
  }
`;

export const BodyColumn = styled(FlexColumn)`
  height: 100%;
  border: 1px solid var(--cogs-greyscale-grey3);
  border-radius: 12px;
  min-width: ${(props: { width: number }) => props.width}px;
  width: auto;
  background: var(--cogs-bg-accent);
`;

export const BodyColumnHeaderWrapper = styled(FlexRow)`
  height: 32px;
  padding: ${sizes.small};
  background: var(--cogs-greyscale-grey2);
  border-bottom: 1px solid var(--cogs-greyscale-grey3);
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
`;

export const BodyColumnHeaderLegend = styled(FlexRow)`
  margin-left: auto;
`;

export const LegendIndicator = styled.div`
  height: ${sizes.small};
  width: ${sizes.small};
  border-radius: 50%;
  margin: 0 ${sizes.extraSmall} 2px ${sizes.normal};
  background: ${(props: { color: string }) => props.color};
`;

export const BodyColumnMainHeader = styled(Flex)`
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  align-items: center;
  letter-spacing: -0.004em;
  color: var(--cogs-greyscale-grey9);
`;

export const BodyColumnSubHeader = styled(Flex)`
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  align-items: center;
  letter-spacing: -0.004em;
  color: rgba(0, 0, 0, 0.45);
`;

export const BodyColumnBody = styled(Flex)`
  height: calc(100% - 32px);
  padding-bottom: ${SCALE_BOTTOM_PADDING}px;
  position: relative;
  > * h6 {
    display: none;
  }
`;

export const DepthMeasurementScale = styled(FlexColumn)`
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  flex-wrap: wrap;
  overflow: hidden;
`;

export const ScaleLine = styled(Flex)`
  height ${SCALE_BLOCK_HEIGHT}px;
  width: 100%;
  border-bottom: 1px solid var(--cogs-greyscale-grey3);
  justify-content: center;
  min-height: ${SCALE_BLOCK_HEIGHT}px;
`;

export const LastScaleBlock = styled(Flex)`
  height: ${SCALE_BLOCK_HEIGHT}px;
  min-height: ${SCALE_BLOCK_HEIGHT}px;
  width: 100%;
  justify-content: center;
`;

export const ScaleLineDepth = styled.div`
  font-size: 12px;
  line-height: ${SCALE_PADDING}px;
  display: flex;
  align-items: center;
  text-align: center;
  letter-spacing: -0.008em;
  color: var(--cogs-greyscale-grey7);
  height: ${SCALE_PADDING}px;
  padding: 0 ${sizes.small};
  top: 32px;
  position: relative;
  background: var(--cogs-greyscale-grey1);
`;

export const EventsCountBadge = styled(Flex)`
  width: ${(props: { size: number }) => props.size}%;
  height: ${(props: { size: number }) => props.size}%;
  min-height: 70%;
  min-width: 70%;
  background: var(--cogs-midblue-4);
  border: 2px solid var(--cogs-white);
  box-sizing: border-box;
  border-radius: 100px;

  font-weight: 500;
  font-size: 12px;
  line-height: ${SCALE_PADDING}px;
  align-items: center;
  justify-content: center;
  letter-spacing: -0.004em;
  color: var(--cogs-white);

  > span {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  &:hover {
    border: 2px solid var(--cogs-midblue-2);
    background-color: #5e71d6;
  }
`;

export const NdsEventsCountBadge = styled(EventsCountBadge)`
  background: rgba(24, 175, 142, 1);

  &:hover {
    border: 2px solid var(--cogs-green-2);
    background-color: rgba(7, 141, 121, 1);
  }
`;

export const EventsCountBadgeWrapper = styled(Flex)`
  width: ${SCALE_BLOCK_HEIGHT}px;
  height: ${SCALE_BLOCK_HEIGHT}px;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

export const EventsCodesWrapper = styled(FlexColumn)`
  padding: ${sizes.small};
  background: rgba(255, 255, 255, 0.0001);
  border-radius: 8px;
  box-shadow: 0 8px 48px rgba(0, 0, 0, 0.1);
  min-width: 200px;
`;

export const EventsCodesHeader = styled(Flex)`
  padding: ${sizes.small};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.008em;
  color: rgba(0, 0, 0, 0.45);
  border-radius: 4px;
`;

export const EventsCodeRow = styled(FlexRow)`
  padding: ${sizes.small};
`;

export const EventsCodeName = styled(Flex)`
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.001em;
  color: var(--cogs-greyscale-grey9);
  border-radius: 4px;
`;

export const EventsCodeCount = styled(Flex)`
  font-size: 14px;
  line-height: 20px;
  color: var(--cogs-text-color-secondary);
  margin-left: auto;
`;

export const EmptyStateWrapper = styled(Flex)`
  white-space: break-spaces;
  max-width: 148px;
  & ${SubTitleText} {
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    display: flex;
    align-items: center;
    text-align: center;
    letter-spacing: -0.004em;
    padding-top: 0;
    justify-content: center;
  }
`;

export const EmptyCasingsStateWrapper = styled(Flex)`
  white-space: break-spaces;
  max-width: 200px;
  height: 100%;
  & ${SubTitleText} {
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    display: flex;
    align-items: center;
    text-align: center;
    letter-spacing: -0.004em;
    padding-top: 0;
    justify-content: center;
  }
`;
