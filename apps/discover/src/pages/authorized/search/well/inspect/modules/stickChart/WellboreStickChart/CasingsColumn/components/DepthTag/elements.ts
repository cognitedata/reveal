import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { Flex, sizes } from 'styles/layout';

import { DEPTH_SCALE_LABEL_HEIGHT } from '../../../constants';

import CasingsTag from './images/CasingsTag.svg';
import CasingsTagLight from './images/CasingsTagLight.svg';
import DepthLimitTag from './images/DepthLimitTag.svg';

type OverlappingProps = { $overlapping: boolean };
type PositionProps = { left: number; top?: number };

const DEPTH_END_MARKER_COLOR = '#4255bb';
const DEPTH_LIMIT_MARKER_COLOR = '#257B3D';

const DEPTH_INDICATOR_END_HEIGHT = '12px';
const DEPTH_INDICATOR_MARKER_SHIFT = '6px';

const DepthTagLabelBase = styled(Flex)`
  background-repeat: no-repeat, no-repeat;
  color: var(--cogs-text-icon--strong);
  height: ${DEPTH_SCALE_LABEL_HEIGHT}px;
  padding-left: ${sizes.extraSmall};
  align-items: center;
  transform: translateY(-50%);
  font-size: 12px;
  line-height: ${sizes.normal};
  padding-top: 2px;
  &:hover {
    z-index: ${layers.TOOLTIP_HOVERED};
  }
`;

export const CasingDepthTagLabel = styled(DepthTagLabelBase)`
  background-image: ${(props: OverlappingProps) =>
    props.$overlapping ? `url(${CasingsTagLight})` : `url(${CasingsTag})`};
  ${(props: PositionProps) => `
    margin-left: -${props.left + 84}px;
    margin-top: ${props.top}px;
  `}
  &:hover {
    background-image: ${`url(${CasingsTag})`};
  }
`;

export const DepthLimitTagLabel = styled(DepthTagLabelBase)`
  background-image: url(${DepthLimitTag});
  margin-left: -81px;
  ${(props: PositionProps) => `
    margin-top: ${props.top}px;
  `}
`;

export const DepthEndMarker = styled.div`
  height: 1px;
  border-bottom: 1px dashed ${DEPTH_END_MARKER_COLOR};
  float: right;
  margin-top: -18px;
  ${(props: { width: number }) => `
    width: calc(${props.width}px + 36px);
    margin-right: calc(-${DEPTH_INDICATOR_MARKER_SHIFT} - ${DEPTH_INDICATOR_END_HEIGHT});
  `}
`;

export const DepthLimitMarker = styled(DepthEndMarker)`
  border-bottom: 1px dashed ${DEPTH_LIMIT_MARKER_COLOR};
  width: calc(100% + ${sizes.normal});
  float: left;
  margin-left: -${sizes.normal};
`;

export const TotalDepthWrapper = styled.div`
  margin-top: -${DEPTH_SCALE_LABEL_HEIGHT}px;
`;
