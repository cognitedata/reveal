import React, { ChangeEvent, useState } from 'react';

import debounce from 'lodash/debounce';
import isNumber from 'lodash/isNumber';
import toNumber from 'lodash/toNumber';
import { toId } from 'utils/toId';

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

export const NumericRangeFilter: React.FC<Props> = ({
  values,
  selectedValues,
  onValueChange,
  config,
}) => {
  const minMaxValues =
    isNumber(values[0]) && isNumber(values[1]) ? values : [0, 0];
  const [selectedMin, selectedMax] = selectedValues || minMaxValues;
  const [fastMinMax, setFastMinMax] = useState<[number, number]>([
    selectedMin,
    selectedMax,
  ]);
  const [min, max] = minMaxValues;
  let [fastMin, fastMax] = fastMinMax;

  // Set range values in initial render.
  React.useEffect(() => {
    if (selectedValues && selectedValues.length === 2) {
      setFastMinMax([selectedValues[0], selectedValues[1]]);
    }
  }, [selectedValues]);

  const debouncedSearch = React.useCallback(
    debounce((from, to) => {
      onValueChange([from, to]);
    }, 300),
    []
  );

  const handleRangeSliderChange = (range: number[]) => {
    const from = range[0];
    const to = range[1];

    if (from !== selectedMin || to !== selectedMax) {
      setFastMinMax([from, to]);
      debouncedSearch(from, to);
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

  const handleEnterPress = (
    event: React.KeyboardEvent<HTMLInputElement>,
    trigger: () => void
  ) => {
    if (event.key === 'Enter') {
      trigger();
    }
  };

  return (
    <RangeFilterWrapper>
      {config?.title && <RangeFilterTitle>{config.title}</RangeFilterTitle>}
      <RangeSliderWrapper>
        <RangeSlider
          min={min}
          max={max}
          value={[fastMin, fastMax]}
          setValue={handleRangeSliderChange}
        />
      </RangeSliderWrapper>
      <InputWrapper>
        <Input
          id={`From-${toId(config?.title || '')}`}
          data-testid={`From-${toId(config?.title || '')}`}
          title="From"
          value={toNumber(fastMinMax[0])}
          onChange={handleMinChange}
          onBlur={handleMinBlur}
          onKeyDown={(event) => {
            handleEnterPress(event, handleMinBlur);
          }}
          type="number"
          min={min}
          max={max}
          variant="titleAsPlaceholder"
          readOnly={!config?.editableTextFields}
        />
        <FlexGrow />
        <Input
          id={`To-${toId(config?.title || '')}`}
          data-testid={`To-${toId(config?.title || '')}`}
          title="To"
          value={toNumber(fastMinMax[1])}
          onBlur={handleMaxBlur}
          onChange={handleMaxChange}
          onKeyDown={(event) => {
            handleEnterPress(event, handleMaxBlur);
          }}
          type="number"
          min={min}
          max={max}
          variant="titleAsPlaceholder"
          readOnly={!config?.editableTextFields}
        />
      </InputWrapper>
    </RangeFilterWrapper>
  );
};
