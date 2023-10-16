import React, { useEffect, useState } from 'react';

import {
  DatePicker,
  FilterLabel,
  RangePicker,
  Select,
} from '@data-exploration/components';
import { isEmpty } from 'lodash';

import { OptionType } from '@cognite/cogs.js';
import { DateRange } from '@cognite/sdk';

import {
  DATA_EXPLORATION_COMPONENT,
  TIME_SELECT,
  useMetrics,
  useTranslation,
  zIndex,
} from '@data-exploration-lib/core';

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
  const { t } = useTranslation();
  const trackUsage = useMetrics();

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
    { value: 'none', label: t('ALL', 'All') },
    ...(enableNull ? [{ value: 'null', label: t('EMPTY', 'Empty') }] : []),
    { value: 'before', label: t('BEFORE', 'Before') },
    { value: 'during', label: t('DURING', 'During') },
    { value: 'after', label: t('AFTER', 'After') },
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
    trackUsage(DATA_EXPLORATION_COMPONENT.SELECT.DATE_FILTER, {
      value: finalValue,
      period: newKey,
      title: label,
    });
  };

  return (
    <div data-testid={`filter-${label}`}>
      {!isEmpty(label) && <FilterLabel>{label}</FilterLabel>}
      <Select
        data-testid={`select-${label}`}
        value={options.find((el) => el.value === period)!}
        options={options}
        isSearchable={false}
        isClearable={false}
        blurInputOnSelect
        menuPosition="fixed"
        isMulti={false}
        cogsTheme="grey"
        onChange={handleOnChange}
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: zIndex.MAXIMUM }),
          menu: (provided) => ({
            ...provided,
            zIndex: `${zIndex.MAXIMUM} !important`,
          }),
        }}
      />
      {(period === 'after' || period === 'before') && (
        <div style={{ marginTop: 8 }}>
          <DatePicker
            id={`date-picker-${label}`}
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
    </div>
  );
};
const CreatedTimeFilter = (props: DateFilterProps) => {
  const { t } = useTranslation();
  return <DateFilter {...props} label={t('CREATED_TIME', 'Created Time')} />;
};

const UpdatedTimeFilter = (props: DateFilterProps) => {
  const { t } = useTranslation();
  return <DateFilter {...props} label={t('UPDATED_TIME', 'Updated Time')} />;
};

const StartTimeFilter = (props: DateFilterProps) => {
  const { t } = useTranslation();
  return <DateFilter {...props} label={t('START_TIME', 'Start time')} />;
};

const EndTimeFilter = (props: DateFilterProps) => {
  const { t } = useTranslation();
  return <DateFilter {...props} label={t('END_TIME', 'End time')} />;
};

DateFilter.StartTime = StartTimeFilter;
DateFilter.Created = CreatedTimeFilter;
DateFilter.EndTime = EndTimeFilter;
DateFilter.Updated = UpdatedTimeFilter;
