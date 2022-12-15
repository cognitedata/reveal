import React, { useEffect, useRef, useState } from 'react';
import { DatePicker, Select, RangePicker } from 'components';
import { TIME_SELECT } from 'containers';
import { DateRange } from '@cognite/sdk';
import { FilterFacetTitle } from '../FilterFacetTitle';
import { OptionType } from '@cognite/cogs.js';
import { useMetrics } from 'hooks/useMetrics';
import { DATA_EXPLORATION_COMPONENT } from 'constants/metrics';

const determinePeriod = (value: DateRange | undefined | null) => {
  if (value === undefined) {
    return 'none';
  }
  if (value === null) {
    return 'null';
  }
  if (value.min && value.max) {
    return 'during';
  }
  if (value.min) {
    return 'after';
  }
  if (value.max) {
    return 'before';
  }
  return 'none';
};

type PeriodType = 'none' | 'before' | 'during' | 'after' | 'null';

export const DateFilterV2 = ({
  value,
  setValue,
  title,
  enableNull = false,
}: {
  title: string;
  enableNull?: boolean;
  value: DateRange | undefined | null;
  setValue: (
    newValue: { min?: number; max?: number } | undefined | null
  ) => void;
}) => {
  const [period, setPeriod] = useState<PeriodType>(determinePeriod(value));
  const trackUsage = useMetrics();

  const prevValueRef = useRef<PeriodType>();
  const prevValue = prevValueRef.current;
  if (
    determinePeriod(value) !== prevValue &&
    determinePeriod(value) !== period
  ) {
    setPeriod(determinePeriod(value));
  }
  useEffect(() => {
    prevValueRef.current = determinePeriod(value);
  }, [value]);

  const startDate = new Date(
    value?.min || value?.max || TIME_SELECT['1Y'].getTime()[0]
  );
  const endDate = new Date(value?.max || new Date());

  const options = [
    { value: 'none', label: 'All' },
    ...(enableNull ? [{ value: 'null', label: 'Empty' }] : []),
    { value: 'before', label: 'Before' },
    { value: 'during', label: 'During' },
    { value: 'after', label: 'After' },
  ];

  const handleOnChange = (newValue: OptionType<string>) => {
    const newKey = (
      newValue as {
        value: 'none' | 'null' | 'before' | 'during' | 'after';
      }
    ).value;
    setPeriod(newKey);
    let finalValue;
    switch (newKey) {
      case 'none': {
        if (value !== undefined) {
          finalValue = undefined;
        }
        break;
      }
      case 'during': {
        if (
          !value ||
          value.min !== startDate.valueOf() ||
          value.max !== endDate.valueOf()
        ) {
          finalValue = { min: startDate.valueOf(), max: endDate.valueOf() };
        }
        break;
      }
      case 'before': {
        if (!value || value.max !== endDate.valueOf()) {
          finalValue = { max: endDate.valueOf() };
        }
        break;
      }
      case 'after': {
        if (!value || value.min !== endDate.valueOf()) {
          finalValue = { min: endDate.valueOf() };
        }
        break;
      }
      case 'null': {
        if (value !== null) {
          finalValue = null;
        }
      }
    }
    setValue(finalValue);
    trackUsage(DATA_EXPLORATION_COMPONENT.SELECT.DATE_FILTER, {
      value: finalValue,
      period: newKey,
      title,
    });
  };

  return (
    <>
      <FilterFacetTitle>{title}</FilterFacetTitle>
      <Select
        value={options.find(el => el.value === period)!}
        options={options}
        isSearchable={false}
        isClearable={false}
        blurInputOnSelect
        isMulti={false}
        cogsTheme="grey"
        onChange={handleOnChange}
      />
      {(period === 'after' || period === 'before') && (
        <div style={{ marginTop: 8 }}>
          <DatePicker
            initialDate={new Date(startDate)}
            onDateChanged={newDate => {
              if (period === 'after') {
                setValue({ min: newDate.valueOf() });
              } else {
                setValue({ max: newDate.valueOf() });
              }
            }}
          />
        </div>
      )}
      {period === 'during' && (
        <div style={{ marginTop: 8 }}>
          <RangePicker
            initialRange={[new Date(startDate), new Date(endDate)]}
            onRangeChanged={dates => {
              setValue({ min: dates[0].valueOf(), max: dates[1].valueOf() });
            }}
          />
        </div>
      )}
    </>
  );
};
