import React, { useEffect, useState } from 'react';

import { DateRange } from '@cognite/sdk';
import { OptionType } from '@cognite/cogs.js';

import {
  DatePicker,
  FilterLabel,
  RangePicker,
  Select,
} from '@data-exploration/components';
import { isEmpty } from 'lodash';
import { TIME_SELECT } from '@data-exploration-lib/core';

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

interface DateFilterProps {
  label?: string;
  enableNull?: boolean;
  value?: DateRange | null;
  onChange: (
    newValue: { min?: number; max?: number } | undefined | null
  ) => void;
}

type PeriodType = 'none' | 'before' | 'during' | 'after' | 'null';

export const DateFilter = ({
  value,
  onChange,
  label,
  enableNull = false,
}: DateFilterProps) => {
  const initialPeriod = determinePeriod(value);
  const [period, setPeriod] = useState<PeriodType>(initialPeriod);

  useEffect(() => {
    setPeriod(initialPeriod);
  }, [initialPeriod]);

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
        const previousMinValue = value?.min && new Date(value.min).getTime();
        if (!value || value.max !== endDate.valueOf()) {
          finalValue = {
            max: previousMinValue || endDate.valueOf(),
          };
        }
        break;
      }
      case 'after': {
        const previousMaxValue = value?.max && new Date(value?.max).getTime();
        if (!value || value.min !== endDate.valueOf()) {
          finalValue = {
            min: previousMaxValue || endDate.valueOf(),
          };
        }
        break;
      }
      case 'null': {
        if (value !== null) {
          finalValue = null;
        }
      }
    }
    onChange(finalValue);
  };

  return (
    <>
      {!isEmpty(label) && <FilterLabel>{label}</FilterLabel>}
      <Select
        value={options.find((el) => el.value === period)!}
        options={options}
        isSearchable={false}
        isClearable={false}
        blurInputOnSelect
        menuPosition="fixed"
        isMulti={false}
        cogsTheme="grey"
        onChange={handleOnChange}
      />
      {(period === 'after' || period === 'before') && (
        <div style={{ marginTop: 8 }}>
          <DatePicker
            initialDate={startDate}
            onDateChanged={(newDate) => {
              if (period === 'after') {
                onChange({ min: newDate.valueOf() });
              } else {
                onChange({ max: newDate.valueOf() });
              }
            }}
          />
        </div>
      )}
      {period === 'during' && (
        <div style={{ marginTop: 8 }}>
          <RangePicker
            initialRange={[new Date(startDate), new Date(endDate)]}
            onRangeChanged={(dates) => {
              onChange({ min: dates[0].valueOf(), max: dates[1].valueOf() });
            }}
          />
        </div>
      )}
    </>
  );
};
const CreatedTimeFilter = (props: DateFilterProps) => {
  return <DateFilter {...props} label="Created Time" />;
};

const UpdatedTimeFilter = (props: DateFilterProps) => {
  return <DateFilter {...props} label="Updated Time" />;
};

const StartTimeFilter = (props: DateFilterProps) => {
  return <DateFilter {...props} label="Start time" />;
};

DateFilter.StartTime = StartTimeFilter;
const EndTimeFilter = (props: DateFilterProps) => {
  return <DateFilter {...props} label="End time" />;
};

DateFilter.Created = CreatedTimeFilter;
DateFilter.EndTime = EndTimeFilter;
DateFilter.Updated = UpdatedTimeFilter;
