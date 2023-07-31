import { RangeSlider } from '@cognite/cogs.js';
import styled from 'styled-components';

export const OpacitySlider = styled(RangeSlider)<{ $color: string }>`
  .rc-slider-rail {
    height: 8px;
    top: 3px;
    background: transparent;
    &:before,
    &:after {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 4px;
      background-image: linear-gradient(
          45deg,
          var(--cogs-greyscale-grey3) 25%,
          transparent 25%
        ),
        linear-gradient(
          -45deg,
          var(--cogs-greyscale-grey3) 25%,
          transparent 25%
        ),
        linear-gradient(45deg, transparent 75%, var(--cogs-greyscale-grey3) 75%),
        linear-gradient(
          -45deg,
          transparent 75%,
          var(--cogs-greyscale-grey3) 75%
        );
      background-size: 8px 8px;
      background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
    }
    &:after {
      background: linear-gradient(
        90deg,
        rgba(0, 0, 0, 0) 0%,
        ${(props) => props.$color} 100%
      );
    }
  }
  .rc-slider-handle {
    border: solid 2px ${(props) => props.$color};
  }
`;
