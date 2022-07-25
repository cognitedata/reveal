import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { Center, Flex, FlexRow, FullWidth, sizes } from 'styles/layout';

import {
  SCALE_BLOCK_HEIGHT,
  SCALE_PADDING,
} from '../../../common/Events/constants';
import { DepthMeasurementScale } from '../../../common/Events/elements';
import {
  DEPTH_SCALE_LABEL_COLOR,
  DEPTH_SCALE_LABEL_HEIGHT,
  DEPTH_SCALE_LABEL_WIDTH,
  MUD_LINE_COLOR,
  RKB_COLOR,
  SEA_LEVEL_COLOR,
} from '../constants';

import { DepthEndMarker } from './components/DepthIndicator/elements';

export const SchemaColumnContentWrapper = styled(FlexRow)`
  height: 100%;
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

export const DepthColumnContainer = styled.div`
  width: 150px;
  height: 100%;
  border-right: 1px solid var(--cogs-greyscale-grey3);
`;

export const DepthMeasurementTypeContainer = styled(FlexRow)`
  width: 100px;
  cursor: pointer;
  align-items: center;
  margin-top: -${sizes.extraSmall};
`;

export const DepthMeasurementTypeWrapper = styled.div`
  width: 30px;
`;

export const DepthMeasurementTypeIconWrapper = styled.span`
  padding-top: 2px;
`;

export const SchemaCasingsDataWrapper = styled(FullWidth)``;

export const DepthScaleLabel = styled(FlexRow)`
  position: absolute;
  top: ${(props: { top: number }) =>
    DEPTH_SCALE_LABEL_HEIGHT + SCALE_PADDING + props.top}px;
  left: 11px;
`;

export const DepthScaleLabelTag = styled(Flex)`
  background: ${DEPTH_SCALE_LABEL_COLOR};
  font-size: 12px;
  line-height: ${sizes.normal};
  text-align: center;
  letter-spacing: -0.008em;
  color: var(--cogs-greyscale-grey7);
  height: ${DEPTH_SCALE_LABEL_HEIGHT + 1}px; // +1 for the middle point pixel
  width: ${DEPTH_SCALE_LABEL_WIDTH}px;
  padding-left: ${sizes.extraSmall};
  align-items: center;
  border-radius: ${sizes.extraSmall} 0 0 ${sizes.extraSmall};

  &:after {
    content: '';
    position: absolute;
    left: ${DEPTH_SCALE_LABEL_WIDTH}px;
    width: 0;
    height: 0;
    border-top: ${DEPTH_SCALE_LABEL_HEIGHT / 2}px solid transparent;
    border-bottom: ${DEPTH_SCALE_LABEL_HEIGHT / 2}px solid transparent;
    border-left: ${sizes.extraSmall} solid ${DEPTH_SCALE_LABEL_COLOR};
  }
`;

export const DepthScaleLabelMarker = styled(DepthEndMarker)`
  width: 22px;
  margin-top: ${DEPTH_SCALE_LABEL_HEIGHT / 2}px;
`;
