/*!
 * Copyright 2023 Cognite AS
 */

import { useState, type ReactElement } from 'react';

import styled from 'styled-components';
import { Slider } from '@cognite/cogs.js';

type OpacitySliderProps = {
  onChange: (value: number) => void;
};

export function OpacitySlider({ onChange }: OpacitySliderProps): ReactElement {
  const [sliderValue, setSliderValue] = useState(0);
  return (
    <StyledSlider
      min={0}
      max={100}
      step={1}
      onChange={(v) => {
        onChange(v);
        setSliderValue(v);
      }}
      value={sliderValue}
    />
  );
}

const StyledSlider = styled(Slider)`
  position: relative;
  left: 20px;
  width: calc(100% - 40px);
`;
