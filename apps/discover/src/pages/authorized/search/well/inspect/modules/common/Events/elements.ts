import styled from 'styled-components/macro';

import { SubTitleText } from 'components/EmptyState/elements';
import { Flex, FlexColumn, FlexRow, sizes } from 'styles/layout';

import { SCALE_BLOCK_HEIGHT, SCALE_PADDING } from './constants';

export const BodyColumn = styled(FlexColumn)`
  border: 1px solid var(--cogs-greyscale-grey3);
  border-radius: 12px;
  min-width: ${(props: { width: number }) => props.width}px;
  width: auto;
  background: var(--cogs-bg-accent);
  margin: ${sizes.small};
`;

export const BodyColumnHeaderWrapper = styled(FlexRow)`
  height: 32px;
  padding: ${sizes.small};
  background: var(--cogs-greyscale-grey2);
  border-bottom: 1px solid var(--cogs-greyscale-grey3);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
`;

export const ColumnHeaderWrapper = styled(FlexRow)`
  height: 32px;
  padding: ${sizes.small};
  background: var(--cogs-greyscale-grey2);
  border-bottom: 1px solid var(--cogs-greyscale-grey3);
`;

export const BodyColumnHeaderLegend = styled(FlexRow)`
  margin-left: auto;
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
  height: 100%;
  position: relative;
  > * h6 {
    display: none;
  }
`;

export const DepthMeasurementScale = styled(FlexColumn)`
  height: 80%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  /* overflow: hidden; This was messing up the scale depth in PPFG&Geo, reach out to Deep if you need to reenable this :) */
`;

export const ScaleLine = styled(Flex)`
  min-height: ${SCALE_BLOCK_HEIGHT}px;
  max-height: ${SCALE_BLOCK_HEIGHT}px;
  height: auto;
  width: 100%;
  border-bottom: 1px solid var(--cogs-greyscale-grey3);
  justify-content: center;
  align-items: center;
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
  top: ${SCALE_BLOCK_HEIGHT / 2 + 1}px;
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

export const ColumnDraggerWrapper = styled(FlexRow)`
  height: 21px;
  padding: ${sizes.small};
  align-items: center;
  justify-content: center;
  background: var(--cogs-greyscale-grey3);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
`;
