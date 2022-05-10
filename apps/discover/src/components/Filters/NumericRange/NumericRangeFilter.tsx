import React, { ChangeEvent, useState } from 'react';

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

  const [focusedField, setFocusedField] = useState<'min' | 'max' | undefined>(
    undefined
  );

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
    const { value } = event.target;
    setFastMinMax((values) => {
      return [Number(value), values[1]];
    });
  };

  const handleMaxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFastMinMax((values) => [values[0], Number(value)]);
  };

  const isValid = () => !getMinValueError() && !getMaxValueError();

  const handleInputBlur = () => {
    if (isValid()) {
      onValueChange([fastMinMax[0], fastMinMax[1]]);
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

  const getMinValueError = () => {
    if (fastMinMax[0] < min) {
      return `Min value is ${min}`;
    }
    if (fastMinMax[0] > fastMinMax[1] && focusedField === 'min') {
      return `Max value is ${fastMinMax[1]}`;
    }

    return false;
  };

  const getMaxValueError = () => {
    if (fastMinMax[1] > max) {
      return `Max value is ${max}`;
    }
    if (fastMinMax[1] < fastMinMax[0] && focusedField === 'max') {
      return `Min value is ${fastMinMax[0]}`;
    }

    return false;
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
          value={(fastMinMax[0] ?? min).toString()}
          onChange={handleMinChange}
          onFocus={() => setFocusedField('min')}
          onBlur={handleInputBlur}
          onKeyDown={(event) => {
            handleEnterPress(event, handleInputBlur);
          }}
          type="number"
          error={getMinValueError()}
          readOnly={!config?.editableTextFields}
        />
        <FlexGrow />
        <Input
          id={`To-${toId(config?.title || '')}`}
          data-testid={`To-${toId(config?.title || '')}`}
          title="To"
          value={(fastMinMax[1] ?? min).toString()}
          onFocus={() => setFocusedField('max')}
          onBlur={handleInputBlur}
          onChange={handleMaxChange}
          onKeyDown={(event) => {
            handleEnterPress(event, handleInputBlur);
          }}
          type="number"
          error={getMaxValueError()}
          readOnly={!config?.editableTextFields}
        />
      </InputWrapper>
    </RangeFilterWrapper>
  );
};
