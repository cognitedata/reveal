import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { Icon } from '@cognite/cogs.js';

import { Center, FlexColumn, sizes } from 'styles/layout';

import { SCALE_BLOCK_HEIGHT } from '../../../common/Events/constants';

export const HoleSectionsColumnContainer = styled.div`
  height: 100%;
  padding-left: ${sizes.extraSmall};
`;

export const HoleSectionLabel = styled(Center)`
  position: absolute;
  padding: 2px;
  height: 18px;
  width: fit-content;
  background: #efeef0;
  border-radius: ${sizes.extraSmall};
  border: 1px solid #cccccc;
  font-weight: 500;
  font-size: 10px;
  line-height: 14px;
  letter-spacing: -0.004em;
  color: var(--cogs-greyscale-grey9);
  z-index: ${layers.OVERLAY};
  transform: translateY(-50%);
  top: ${(props: { top: number }) => props.top + SCALE_BLOCK_HEIGHT}px;
`;

export const InfoIcon = styled(Icon)`
  color: var(--cogs-text-secondary);
  margin-left: ${sizes.extraSmall};
  cursor: pointer;
`;

export const MugWeightInfo = styled(FlexColumn)`
  padding: ${sizes.extraSmall};
  &:not(:last-child) {
    border-bottom: 1px solid var(--cogs-border--interactive--default);
    margin-bottom: ${sizes.extraSmall};
  }
`;

export const MugWeightType = styled.span`
  font-weight: 600;
`;

export const MugWeightValue = styled.span``;
