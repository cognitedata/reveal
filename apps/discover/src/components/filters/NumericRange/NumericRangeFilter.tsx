import React, { ChangeEvent, useState } from 'react';

import isNumber from 'lodash/isNumber';
import toNumber from 'lodash/toNumber';

import { Input, RangeSlider } from '@cognite/cogs.js';

import { FlexGrow } from 'styles/layout';

import {
  InputWrapper,
  RangeFilterTitle,
  RangeFilterWrapper,
  RangeSliderWrapper,
} from './elements';

interface Props {
  onValueChange: (selectedRange: number[]) => void;
  selectedValues: number[];
  values: number[];
  config?: Config;
}

interface Config {
  fromToPreLabel?: string;
  title?: string;
  editableTextFields?: boolean;
}

export const NumericRangeFilter: React.FC<Props> = (props) => {
  const { values, selectedValues, onValueChange, config } = props;
  const minMaxValues =
    isNumber(values[0]) && isNumber(values[1]) ? values : [0, 0];
  const [selectedMin, selectedMax] = selectedValues || minMaxValues;
  const [fastMinMax, setFastMinMax] = useState<[number, number]>([
    selectedMin,
    selectedMax,
  ]);

  // Set range values in initial render.
  React.useEffect(() => {
    if (selectedValues && selectedValues.length === 2) {
      setFastMinMax([selectedValues[0], selectedValues[1]]);
    }
  }, [selectedValues]);

  const [min, max] = minMaxValues;

  const handleRangeSliderChange = (range: number[]) => {
    const from = range[0];
    const to = range[1];

    if (from !== selectedMin || to !== selectedMax) {
      setFastMinMax([from, to]);
      onValueChange([from, to]);
    }
  };

  const handleMinChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    setFastMinMax((values) => [Number(target.value), values[1]]);
  };

  const handleMaxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    setFastMinMax((values) => [values[0], Number(target.value)]);
  };

  const handleMinBlur = () => {
    // eslint-disable-next-line prefer-const
    let [fastMin, fastMax] = fastMinMax;
    if (fastMin < min) {
      fastMin = min;
    } else if (fastMin > fastMax) {
      fastMin = fastMax;
    }
    if (fastMin !== selectedMin) {
      onValueChange([fastMin, selectedMax]);
    } else {
      setFastMinMax((values) => [selectedMin, values[1]]);
    }
  };

  const handleMaxBlur = () => {
    // eslint-disable-next-line prefer-const
    let [fastMin, fastMax] = fastMinMax;
    if (fastMax > max) {
      fastMax = max;
    } else if (fastMax < fastMin) {
      fastMax = fastMin;
    }
    if (fastMax !== selectedMax) {
      onValueChange([selectedMin, fastMax]);
    } else {
      setFastMinMax((values) => [values[0], selectedMax]);
    }
  };

  return (
    <RangeFilterWrapper>
      {config?.title && <RangeFilterTitle>{config.title}</RangeFilterTitle>}
      <RangeSliderWrapper>
        <RangeSlider
          min={min}
          max={max}
          value={[selectedMin, selectedMax]}
          setValue={handleRangeSliderChange}
        />
      </RangeSliderWrapper>
      <InputWrapper>
        <Input
          id="From"
          title="From"
          value={toNumber(fastMinMax[0])}
          onChange={handleMinChange}
          onBlur={handleMinBlur}
          type="number"
          min={min}
          max={max}
          variant="titleAsPlaceholder"
          readOnly={!config?.editableTextFields}
          data-testid="from"
        />
        <FlexGrow />
        <Input
          id="To"
          title="To"
          value={toNumber(fastMinMax[1])}
          onBlur={handleMaxBlur}
          onChange={handleMaxChange}
          type="number"
          min={min}
          max={max}
          variant="titleAsPlaceholder"
          readOnly={!config?.editableTextFields}
          data-testid="to"
        />
      </InputWrapper>
    </RangeFilterWrapper>
  );
};
