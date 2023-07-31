import { RangeSlider } from '@cognite/cogs.js';

import { FlexRow } from 'styles/layout';

import { RangeSelectContainer, RangeSliderWrapper } from './elements';
import { NumberInput } from './NumberInput';
import { RangeSelectProps } from './types';

export const RangeSelect: React.FC<RangeSelectProps> = ({
  range,
  selectedRange,
  onChange,
  width,
}) => {
  const [min, max] = range;
  const [selectedMin, selectedMax] = selectedRange;

  const handleChangeMin = (value: number) => onChange([value, selectedMax]);
  const handleChangeMax = (value: number) => onChange([selectedMin, value]);

  return (
    <RangeSelectContainer width={width}>
      <RangeSliderWrapper>
        <RangeSlider
          min={min}
          max={max}
          defaultValue={selectedRange}
          value={selectedRange}
          setValue={onChange}
        />
      </RangeSliderWrapper>

      <FlexRow>
        <NumberInput
          range={[min, selectedMax]}
          value={selectedMin}
          onChange={handleChangeMin}
        />
        <NumberInput
          range={[selectedMin, max]}
          value={selectedMax}
          onChange={handleChangeMax}
        />
      </FlexRow>
    </RangeSelectContainer>
  );
};
