import React, { useEffect, useMemo, useState } from 'react';

import { Input, RangeSlider } from '@cognite/cogs.js';

import { showErrorMessage } from 'components/Toast';
import { useTranslation } from 'hooks/useTranslation';

import { DEFAULT_COLOR_SCALE_RANGE, VALUE_NOT_IN_RANGE } from '../constants';
import { Tuplet } from '../types';

import { ColorScaleWrapper, SliderWrapper, ToggleButton } from './elements';

interface Props {
  startColor: string;
  middleColor: string;
  endColor: string;
  amplitudeRange: Tuplet;
  setColorScaleRange: (range: Tuplet) => void;
}

export const ColorScale: React.FC<Props> = (props) => {
  const {
    startColor,
    middleColor,
    endColor,
    amplitudeRange,
    setColorScaleRange,
  } = props;

  const [sliderRange, setSliderRange] = useState<Tuplet>(
    DEFAULT_COLOR_SCALE_RANGE
  );
  const [valueRange, setValueRange] = useState<Tuplet>(amplitudeRange);
  const [fastValueRange, setFastValueRange] = useState<Tuplet>(amplitudeRange);
  const [symmetricMode, setSymmetricMode] = useState<boolean>(false);
  const [manualChange, setManualChange] = useState<boolean>(false);

  const { t } = useTranslation();

  const setSliderValue = (values: number[]) => {
    if (values[0] > 50 || values[1] < 50) {
      return;
    }
    if (values[0] !== sliderRange[0]) {
      setSliderRange([values[0], symmetricMode ? 100 - values[0] : values[1]]);
    } else if (values[1] !== sliderRange[1]) {
      setSliderRange([symmetricMode ? 100 - values[1] : values[0], values[1]]);
    }
  };

  useEffect(() => {
    // Calculated max amplitude value from slider percentage
    const valueRight = Math.round(
      (amplitudeRange[1] * ((sliderRange[1] - 50) * 2)) / 100
    );
    // Calculated min amplitude value from slider percentage
    const valueLeft = Math.round(
      (amplitudeRange[0] * ((50 - sliderRange[0]) * 2)) / 100
    );
    if (!manualChange) {
      setValueRange([valueLeft, valueRight]);
      setFastValueRange([valueLeft, valueRight]);
    } else {
      setManualChange(false);
    }
    setColorScaleRange(sliderRange);
  }, [sliderRange]);

  useEffect(() => {
    // When color band changes, set the slider min and max position by default
    setSliderRange(DEFAULT_COLOR_SCALE_RANGE);
  }, [startColor, middleColor, endColor]);

  const onMinBlur = () => {
    // Validate min amplitude value and set on field leave
    if (fastValueRange[0] >= amplitudeRange[0] && fastValueRange[0] <= 0) {
      setManualChange(true);
      setValueRange(fastValueRange);
      let sliderX =
        (((50 / 100) * fastValueRange[0]) / amplitudeRange[0]) * 100 + 50;
      sliderX = Math.round(sliderX);
      setSliderRange([sliderX, symmetricMode ? 100 - sliderX : sliderRange[1]]);
    } else {
      showErrorMessage(t(VALUE_NOT_IN_RANGE));
      setFastValueRange(valueRange);
    }
  };

  const onMaxBlur = () => {
    // Validate max amplitude value and set on field leave
    if (fastValueRange[1] <= amplitudeRange[1] && fastValueRange[1] >= 0) {
      setManualChange(true);
      setValueRange(fastValueRange);
      let sliderY =
        (((50 / 100) * fastValueRange[1]) / amplitudeRange[1]) * 100 + 50;
      sliderY = Math.round(sliderY);
      setSliderRange([symmetricMode ? 100 - sliderY : sliderRange[0], sliderY]);
    } else {
      showErrorMessage(t(VALUE_NOT_IN_RANGE));
      setFastValueRange(valueRange);
    }
  };

  // Color gradient based on color band and color scale
  const colorGradient = useMemo(() => {
    if (middleColor) {
      return `linear-gradient(to right, ${startColor} ${sliderRange[0]}%, ${middleColor} 50%, ${endColor} ${sliderRange[1]}%)`;
    }
    return `linear-gradient(to right, ${startColor} ${sliderRange[0]}%, ${endColor} ${sliderRange[1]}%)`;
  }, [startColor, middleColor, endColor, sliderRange]);

  return (
    <>
      <ColorScaleWrapper>
        <Input
          type="number"
          value={fastValueRange[0]}
          size="small"
          min={amplitudeRange[0]}
          max={0}
          onChange={(e) => {
            setFastValueRange([parseFloat(e.target.value), fastValueRange[1]]);
          }}
          onBlur={onMinBlur}
          data-testid="min-value-text"
        />
        <SliderWrapper background={colorGradient}>
          <RangeSlider
            min={DEFAULT_COLOR_SCALE_RANGE[0]}
            max={DEFAULT_COLOR_SCALE_RANGE[1]}
            value={sliderRange}
            setValue={setSliderValue}
          />
        </SliderWrapper>
        <Input
          type="number"
          value={fastValueRange[1]}
          size="small"
          min={0}
          max={amplitudeRange[1]}
          onChange={(e) => {
            setFastValueRange([fastValueRange[0], parseFloat(e.target.value)]);
          }}
          onBlur={onMaxBlur}
          data-testid="max-value-text"
        />
      </ColorScaleWrapper>
      <ToggleButton
        // Had to use this way inorder to get riddoff from 'Received `true` for a non-boolean attribute `toggled`.' waring.
        toggled={symmetricMode ? 1 : 0}
        type="tertiary"
        variant="tertiary"
        size="small"
        icon="ResourceSequences"
        title="Symmetric Mode"
        aria-label="Symmetric Mode"
        onClick={() => {
          setSymmetricMode(!symmetricMode);
        }}
      />
    </>
  );
};
