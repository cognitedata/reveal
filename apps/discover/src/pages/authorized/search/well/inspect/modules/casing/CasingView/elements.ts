import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { SubTitleText } from 'components/EmptyState/elements';
import { Center, Flex, FlexColumn, FlexRow, sizes } from 'styles/layout';

import { SCALE_BLOCK_HEIGHT } from '../../common/Events/constants';

import { MUD_LINE_COLOR, RKB_COLOR, SEA_LEVEL_COLOR } from './constants';
import { Description } from './DepthIndicator/elements';

export const DepthIndicatorGutter = styled(Description)`
  display: inline-block;
  visibility: hidden;
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

export const SchemaContent = styled(FlexColumn)`
  position: relative;
  height: 100%;
`;

export const DepthIndicatorsContainer = styled(Center)`
  position: relative;
  height: 100%;
  padding: ${sizes.normal};
  padding-top: ${SCALE_BLOCK_HEIGHT}px;
`;

export const SchemaTopContent = styled.span`
  position: absolute;
  width: 100%;
  padding-top: ${SCALE_BLOCK_HEIGHT}px;
  z-index: ${layers.MAIN_LAYER};
`;

export const DepthBlock = styled(Flex)`
  position: relative;
  width: 100%;
  align-items: center;
  ${(props: { height: number; pointer: boolean }) => `
    height: ${props.height}px;
    cursor: ${props.pointer ? 'pointer' : 'auto'};
  `};
`;

export const RkbLevel = styled(DepthBlock)`
  background: var(--cogs-bg-default);
  border-top: 1px dashed ${RKB_COLOR};
`;

export const WaterDepth = styled(DepthBlock)`
  background: var(--cogs-midblue-7);
  border-top: 1px dashed ${SEA_LEVEL_COLOR};
  border-bottom: 1px dashed ${MUD_LINE_COLOR};
`;

export const DepthLabel = styled.div`
  background: var(--cogs-greyscale-grey2);
  padding: 2px 6px;
  border-radius: ${sizes.extraSmall};
  width: fit-content;
  font-weight: 600;
  font-size: 10px;
  line-height: 14px;
  margin-left: 32px;
  cursor: pointer;
`;
