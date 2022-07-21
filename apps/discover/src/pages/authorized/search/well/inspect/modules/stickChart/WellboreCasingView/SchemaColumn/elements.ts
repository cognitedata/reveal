import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { Center, Flex, FlexRow, sizes } from 'styles/layout';

import {
  SCALE_BLOCK_HEIGHT,
  SCALE_BOTTOM_PADDING,
} from '../../../common/Events/constants';
import { DepthMeasurementScale } from '../../../common/Events/elements';
import { MUD_LINE_COLOR, RKB_COLOR, SEA_LEVEL_COLOR } from '../constants';

export const SchemaColumnHeaderWrapper = styled(FlexRow)`
  height: 32px;
  padding: ${sizes.small};
  background: var(--cogs-greyscale-grey2);
  border-bottom: 1px solid var(--cogs-greyscale-grey3);
`;

export const SchemaColumnContentWrapper = styled(Flex)`
  height: calc(100% - 32px);
  padding-bottom: ${SCALE_BOTTOM_PADDING}px;
  position: relative;
  > * h6 {
    display: none;
  }
`;

export const HeaderText = styled(Flex)`
  font-weight: 500;
  font-size: 12px;
  line-height: ${sizes.normal};
  align-items: center;
  letter-spacing: -0.004em;
  color: var(--cogs-greyscale-grey9);
`;

export const LegendWrapper = styled(FlexRow)`
  margin-left: auto;
`;

export const LegendIndicator = styled.div`
  height: ${sizes.small};
  width: ${sizes.small};
  border-radius: 50%;
  margin: 0 ${sizes.extraSmall} 2px ${sizes.normal};
  background: ${(props: { color: string }) => props.color};
`;

export const DepthMeasurementScaleWrapper = styled(DepthMeasurementScale)`
  align-content: center;
`;

export const DepthIndicatorsContainer = styled(Center)`
  position: relative;
  height: 100%;
  width: 100%;
  padding: ${sizes.normal};
  padding-top: ${SCALE_BLOCK_HEIGHT}px;
`;

export const TopContentWrapper = styled.span`
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
