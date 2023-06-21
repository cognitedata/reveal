import React from 'react';
import { Slider } from 'antd';
import { SliderMarks } from 'antd/lib/slider';
import styled from 'styled-components';

const createLinearGradient = (
  values: [number, number],
  startColor: string,
  endColor: string
) => {
  return `linear-gradient(to right, ${startColor} 0% ${values[0]}%, ${endColor} ${values[1]}% 100%)`;
};

interface RangeSliderProps {
  values: [number, number];
  defaultValues: [number, number];
  railColor: [string, string] | string;
  trackColor: string;
  setValues: (value: [number, number]) => void;
  marks?: SliderMarks;
  formatter?: (value?: number) => string;
}

export const RangeSlider = (props: RangeSliderProps) => {
  const railColor = Array.isArray(props.railColor)
    ? createLinearGradient(props.values, props.railColor[0], props.railColor[1])
    : props.railColor;
  return (
    <StyledSliderContainer trackColor={props.trackColor} railColor={railColor}>
      <Slider
        range={{ draggableTrack: true }}
        marks={props.marks}
        value={props.values}
        defaultValue={props.defaultValues}
        onChange={props.setValues}
        tipFormatter={props.formatter}
      />
    </StyledSliderContainer>
  );
};

interface StyledSliderContainerProps {
  trackColor: string;
  railColor: string;
}

const StyledSliderContainer = styled.div<StyledSliderContainerProps>`
  .ant-slider-track {
    background-color: ${(props) => props.trackColor};
    height: 8px;
  }
  .ant-slider-rail {
    background: ${(props) => props.railColor};
    height: 8px;
  }
  .ant-slider-handle {
    margin-top: -3px;
    border: solid 2px ${(props) => props.trackColor};
    border-color: ${(props) => props.trackColor};
  }
  .ant-slider-handle:not(.ant-tooltip-open) {
    margin-top: -3px;
    border: solid 2px ${(props) => props.trackColor};
  }
  .ant-slider-dot {
    top: 0px;
  }
`;
