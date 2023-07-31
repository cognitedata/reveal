import styled from 'styled-components/macro';

import { Slider } from '@cognite/cogs.js';

import { Flex, FlexColumn, sizes } from 'styles/layout';

export const Count = styled(Flex)`
  color: var(--cogs-greyscale-grey7);
  font-size: var(--cogs-b3-font-size);
  line-height: var(--cogs-b3-line-height);
  letter-spacing: -2.5e-5em;
  height: 18px;
`;

export const HistogramHolder = styled(FlexColumn)`
  margin-top: 20px;
`;

export const HistogramBar = styled(Slider)`
  margin-top: ${sizes.extraSmall};
  height: 8px;
  padding: 0;
  .rc-slider-handle {
    display: none;
  }
  .rc-slider-track {
    background: #8791e7;
    border-radius: 2px;
    height: 8px;
  }
  .rc-slider-rail {
    top: 2px;
  }
`;
