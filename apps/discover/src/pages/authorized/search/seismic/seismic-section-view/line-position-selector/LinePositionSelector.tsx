import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import isUndefined from 'lodash/isUndefined';

import { Input } from '@cognite/cogs.js';

import { showErrorMessage } from 'components/Toast';
import { LineProps } from 'modules/seismicSearch/types';

import { VALUE_NOT_IN_RANGE } from '../constants';
import { VertSeperator } from '../elements';

import {
  BoldLabel,
  IncrementButton,
  IncrementValue,
  LinePositionSelectorWrapper,
} from './elements';

interface Props {
  lineType: string;
  lineRange: LineProps;
  onChange: (position: number) => void;
}

const INCREMENT_VALUE = 20;

export const LinePositionSelector: React.FC<Props> = ({
  lineType,
  lineRange,
  onChange,
}) => {
  const { t } = useTranslation();

  const [position, setPosition] = useState<number>();
  const [fastPosition, setFastPosition] = useState<number>(0);

  useEffect(() => {
    const defaultPosition = Math.round((lineRange.min + lineRange.max) / 2);
    setPosition(defaultPosition);
  }, [lineRange]);

  const onIncrement = () => {
    if (position) {
      const value = position + INCREMENT_VALUE;
      setPosition(value > lineRange.max ? lineRange.max : value);
    }
  };

  const onDecrement = () => {
    if (position) {
      const value = position - INCREMENT_VALUE;
      setPosition(value < lineRange.min ? lineRange.min : value);
    }
  };

  // Validate manually entered value and set in state
  const onBlur = () => {
    if (
      !isUndefined(fastPosition) &&
      fastPosition >= lineRange.min &&
      fastPosition <= lineRange.max
    ) {
      setPosition(fastPosition);
    } else {
      showErrorMessage(t(VALUE_NOT_IN_RANGE));
      setFastPosition(position as number);
    }
  };

  useEffect(() => {
    if (!isUndefined(position)) {
      if (position !== fastPosition) setFastPosition(position);
      onChange(position);
    }
  }, [position]);

  return (
    <LinePositionSelectorWrapper>
      <BoldLabel>Increment: </BoldLabel>
      <IncrementButton
        type="ghost"
        size="small"
        shape="round"
        icon="Left"
        onClick={onDecrement}
        aria-label="Decrement"
      />
      <IncrementValue>{INCREMENT_VALUE}</IncrementValue>
      <IncrementButton
        type="ghost"
        size="small"
        shape="round"
        icon="ChevronRight"
        onClick={onIncrement}
        aria-label="Increment"
      />
      <VertSeperator />
      <BoldLabel>{lineType}: </BoldLabel>
      <Input
        type="number"
        value={fastPosition}
        size="small"
        min={lineRange.min}
        max={lineRange.max}
        onChange={(e) => {
          setFastPosition(parseFloat(e.target.value));
        }}
        onBlur={onBlur}
      />
      / <IncrementValue>{lineRange.max}</IncrementValue>
    </LinePositionSelectorWrapper>
  );
};
