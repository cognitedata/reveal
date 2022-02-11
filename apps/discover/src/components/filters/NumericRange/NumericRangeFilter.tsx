import React, { ChangeEvent, useState } from 'react';

import toNumber from 'lodash/toNumber';
import { toId } from 'utils/toId';

import { Input, RangeSlider } from '@cognite/cogs.js';

import { useDebounce } from 'hooks/useDebounce';
import { FlexGrow } from 'styles/layout';

import {
  InputWrapper,
  RangeFilterTitle,
  RangeFilterWrapper,
  RangeSliderWrapper,
} from './elements';

interface Props {
  onValueChange: (selectedRange: number[]) => void;
  selectedValues: number[] | undefined;
  min: number;
  max: number;
  config?: Config;
}

interface Config {
  fromToPreLabel?: string;
  title?: string;
  editableTextFields?: boolean;
}

export const NumericRangeFilter: React.FC<Props> = ({
  selectedValues,
  onValueChange,
  config,
  min = 0,
  max = 0,
}) => {
  const [[selectedMin, selectedMax], setSelectedRange] = useState(
    selectedValues || [min, max]
  );
  const [fastMinMax, setFastMinMax] = useState<[number, number]>([
    selectedMin,
    selectedMax,
  ]);

  let [fastMin, fastMax] = fastMinMax;

  React.useEffect(() => {
    setSelectedRange([min, max]);
    setFastMinMax([min, max]);
  }, [min, max]);

  // Set range values in initial render.
  React.useEffect(() => {
    if (selectedValues && selectedValues.length === 2) {
      setFastMinMax([selectedValues[0], selectedValues[1]]);
    } else {
      setFastMinMax([selectedMin, selectedMax]);
    }
  }, [selectedValues]);

  const debouncedSearch = useDebounce((from: number, to: number) => {
    onValueChange([from, to]);
  }, 300);

  const handleRangeSliderChange = (range: number[]) => {
    const from = range[0];
    const to = range[1];

    setFastMinMax([from, to]);
    debouncedSearch(from, to);
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
      onValueChange([fastMin, fastMax]);
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
      onValueChange([fastMin, fastMax]);
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
          min={selectedMin}
          max={selectedMax}
          value={fastMinMax}
          setValue={handleRangeSliderChange}
        />
      </RangeSliderWrapper>
      <InputWrapper>
        <Input
          id={`From-${toId(config?.title || '')}`}
          data-testid={`From-${toId(config?.title || '')}`}
          title="From"
          value={toNumber(fastMinMax[0]) || min}
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
          value={toNumber(fastMinMax[1]) || max}
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
