import styled from 'styled-components/macro';

import { Button } from '@cognite/cogs.js';

export const ToggleButton = styled(Button)`
  height: auto !important;
  margin: 0 4px;
  border: 1px solid var(--cogs-greyscale-grey5) !important;
`;

export const ColorScaleWrapper = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  & > input {
    width: 60px;
    padding: 0 5px;
  }
`;

export const SliderWrapper = styled.div`
  background: ${(props: { background: string }) => props.background};
  height: 100%;
  display: flex;
  align-items: center;
  margin: 0 10px;
  & > .rc-slider {
    width: 150px;
    & > .rc-slider-rail {
      display: none;
    }
    & > .rc-slider-step {
      display: none;
    }
    & > .rc-slider-track {
      display: none;
    }
    & > .rc-slider-handle {
      border: solid 1px var(--cogs-primary);
      box-shadow: inset 0 0 1px 1px var(--cogs-white);
    }
    & > .rc-slider-handle-dragging {
      box-shadow: inset 0 0 1px 1px var(--cogs-white);
    }
    & > .rc-slider-mark {
      display: none;
    }
  }
`;
