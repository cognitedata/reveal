import Tag from 'images/tag.svg';
import TagLight from 'images/tagLight.svg';
import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { Flex, Menu } from '@cognite/cogs.js';

import { Center, sizes } from 'styles/layout';

import {
  DEPTH_SCALE_LABEL_HEIGHT,
  DEPTH_SCALE_LABEL_WIDTH,
} from '../../../constants';

import {
  DEPTH_END_MARKER_COLOR,
  DEPTH_INDICATOR_END_HEIGHT,
  DEPTH_INDICATOR_LINE_WIDTH,
  DEPTH_INDICATOR_MARKER_SHIFT,
  DEPTH_INDICATOR_SPACING,
  DEPTH_SCALE_LABEL_MARKER_WIDTH,
  DEPTH_SEGMENT_COLOR,
  TOOLTIP_HOVER_AREA,
} from './constants';

type OverlappingProps = { $overlapping: boolean };
type DepthMarkerLabelPositionProps = { left: number };

export const DepthIndicatorWrapper = styled.div`
  display: inline-block;
  width: ${DEPTH_INDICATOR_LINE_WIDTH};
  height: 100%;
  margin-right: ${DEPTH_INDICATOR_SPACING};
`;

export const DepthIndicatorLineWrapper = styled(Center)`
  width: calc(${TOOLTIP_HOVER_AREA} + ${TOOLTIP_HOVER_AREA});
  ${(props: { height?: string; disablePointer?: boolean }) => `
    height: ${props.height};
    cursor: ${props.disablePointer ? 'auto' : 'pointer'}
  `}
`;

export const DepthIndicatorLine = styled.div`
  width: ${DEPTH_INDICATOR_LINE_WIDTH};
  box-sizing: border-box;
  float: left;
  ${(props: { color: string; height?: string }) => `
    background: ${props.color};
    height: 100%;
  `}
`;

export const Description = styled.div`
  position: relative;
  bottom: -${DEPTH_INDICATOR_LINE_WIDTH};
  text-transform: lowercase;
  padding: 2px;

  height: 18px;
  background: #efeef0;
  border-radius: 4px;

  font-weight: 500;
  font-size: 10px;
  line-height: 14px;
  display: flex;
  align-items: center;
  letter-spacing: -0.004em;
  color: var(--cogs-greyscale-grey9);
`;

export const DescriptionUnflipped = styled(Description)`
  float: left;
  left: calc(${DEPTH_INDICATOR_LINE_WIDTH} + 2px); // adding the padding value
`;

export const DescriptionFlipped = styled(Description)`
  float: right;
  right: calc(${DEPTH_INDICATOR_LINE_WIDTH} + 2px); // adding the padding value
`;

export const TriangleBottom = styled.div`
  width: 0;
  height: 0;
  border-bottom: 12px solid ${DEPTH_SEGMENT_COLOR};
  border-right: ${DEPTH_INDICATOR_END_HEIGHT} solid transparent;
  border-left: ${DEPTH_INDICATOR_LINE_WIDTH} solid ${DEPTH_SEGMENT_COLOR};
  margin-left: ${DEPTH_INDICATOR_END_HEIGHT};
  float: left;
`;

export const SideLine = styled.div`
  width: 0;
  height: 0;
  border-bottom: ${DEPTH_INDICATOR_LINE_WIDTH} solid ${DEPTH_SEGMENT_COLOR};
  border-right: calc(
      ${DEPTH_INDICATOR_LINE_WIDTH} + ${DEPTH_INDICATOR_LINE_WIDTH} +
        ${DEPTH_INDICATOR_SPACING}
    )
    solid ${DEPTH_SEGMENT_COLOR};
  margin-bottom: -${DEPTH_INDICATOR_LINE_WIDTH};
  margin-left: 6px;
  float: left;
`;

export const TooptipSection = styled(Menu.Item)`
  flex-direction: column;
  align-items: flex-start;
`;

export const FlipHorizontal = styled.div`
  ${(props: { flip: boolean }) => props.flip && `transform: scaleX(-1)`};
`;

export const DepthEndMarker = styled.div`
  height: 1px;
  border-bottom: 1px dashed ${DEPTH_END_MARKER_COLOR};
  float: right;
`;

export const DepthEndMarkerForLine = styled(DepthEndMarker)`
  ${(props: { width: number }) => `
    width: calc(${props.width}px + ${DEPTH_INDICATOR_LINE_WIDTH} + ${DEPTH_INDICATOR_MARKER_SHIFT} + ${DEPTH_SCALE_LABEL_MARKER_WIDTH}px);
    margin-right: -${DEPTH_INDICATOR_MARKER_SHIFT};
  `}
`;

export const DepthEndMarkerForTriangle = styled(DepthEndMarker)`
  ${(props: { width: number }) => `
    width: calc(${props.width}px + ${DEPTH_INDICATOR_LINE_WIDTH} + ${DEPTH_INDICATOR_END_HEIGHT} + ${DEPTH_INDICATOR_MARKER_SHIFT} + ${DEPTH_SCALE_LABEL_MARKER_WIDTH}px);
    margin-right: calc(-${DEPTH_INDICATOR_MARKER_SHIFT} - ${DEPTH_INDICATOR_END_HEIGHT});
  `}
`;

export const DepthScaleLabelTag = styled(Flex)`
  background-image: ${(props: OverlappingProps) =>
    props.$overlapping ? `url(${TagLight})` : `url(${Tag})`};
  background-repeat: no-repeat, no-repeat;
  color: var(--cogs-text-icon--strong);
  height: ${DEPTH_SCALE_LABEL_HEIGHT + 1}px; // +1 for the middle point pixel
  width: ${DEPTH_SCALE_LABEL_WIDTH}px;
  padding-left: ${sizes.extraSmall};
  align-items: center;
  margin-top: -${DEPTH_SCALE_LABEL_HEIGHT / 2 + 1}px; // +1 for the middle point pixel
  margin-bottom: -${DEPTH_SCALE_LABEL_HEIGHT / 2 + 1}px; // +1 for the middle point pixel
  margin-left: -${(props: DepthMarkerLabelPositionProps) => `${props.left + DEPTH_SCALE_LABEL_WIDTH + DEPTH_SCALE_LABEL_MARKER_WIDTH}px`};
  font-size: 12px;
  line-height: ${sizes.normal};
  padding-top: 2px;
  &:hover {
    z-index: ${layers.TOOLTIP_HOVERED};
    background-image: ${`url(${Tag})`};
  }
`;
