import React, { useEffect, useState } from 'react';
import { Input, Tooltip } from '@cognite/cogs.js';
import { FilterFacetTitle } from '../FilterFacetTitle';
import styled from 'styled-components';
import { isNumber } from '@data-exploration-components/utils/numbers';
import { useMetrics } from '@data-exploration-components/hooks/useMetrics';
import { DATA_EXPLORATION_COMPONENT } from '@data-exploration-components/constants/metrics';

export const NumberFilter = ({
  value,
  setValue,
  title,
  placeholder = 'Enter exact match...',
}: {
  title: string;
  placeholder?: string;
  value: number | undefined;
  setValue: (newValue: number | undefined) => void;
}) => {
  const [error, setError] = useState(false);
  const trackUsage = useMetrics();

  const resetError = () => {
    if (error) {
      setError(false);
    }
  };

  // Using effect to reset the error state, since the value can be controlled by outside of this component (i.e., applied filter tags)
  useEffect(() => {
    if (value === undefined || isNumber(value)) {
      resetError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleValueChange = (newValue: string | undefined) => {
    if (newValue === undefined || newValue === '') {
      return setValue(undefined);
    }

    const value = Number(newValue);
    if (isNumber(value)) {
      return setValue(value);
    }

    setError(true);
  };

  return (
    <>
      <FilterFacetTitle>{title}</FilterFacetTitle>

      <Tooltip content="Input must be a number" disabled={!error}>
        <StyledInput
          variant="noBorder"
          error={error}
          fullWidth
          value={value ? String(value) : ''}
          placeholder={placeholder}
          icon={error ? 'Error' : undefined}
          iconPlacement="right"
          onChange={(ev) => {
            handleValueChange(ev.target.value);
            trackUsage(DATA_EXPLORATION_COMPONENT.INPUT.NUMBER_FILTER, {
              value: ev.target.value,
              title,
            });
          }}
        />
      </Tooltip>
    </>
  );
};

const StyledInput = styled(Input)`
  width: 100%;
`;
