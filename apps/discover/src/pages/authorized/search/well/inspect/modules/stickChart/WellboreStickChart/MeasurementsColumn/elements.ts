import styled from 'styled-components/macro';

import { Center, sizes } from 'styles/layout';

import { SCALE_BLOCK_HEIGHT } from '../../../common/Events/constants';

export const PressureDataLabelWrapper = styled(Center)`
  position: absolute;
  width: 100%;
  top: ${(props: { top: number }) => props.top + SCALE_BLOCK_HEIGHT}px;
  transform: translateY(-50%);
`;

export const MeasurementLabel = styled(Center)`
  padding: 2px;
  margin-right: ${sizes.extraSmall};
  height: 18px;
  width: fit-content;
  background: #f5f5f5;
  border-radius: ${sizes.extraSmall};
  font-weight: 500;
  font-size: 10px;
  line-height: 14px;
  letter-spacing: -0.004em;
  color: var(--cogs-greyscale-grey9);
`;
