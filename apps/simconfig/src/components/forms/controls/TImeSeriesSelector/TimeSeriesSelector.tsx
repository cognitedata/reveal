import React, { useCallback, useEffect, useState } from 'react';
import type { ActionMeta, InputActionMeta } from 'react-select';

import debounce from 'lodash/debounce';
import styled from 'styled-components/macro';

import { AutoComplete } from '@cognite/cogs.js';
import type { AutoCompleteProps, OptionType } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import type {
  DatapointAggregate,
  DoubleDatapoint,
  Timeseries,
} from '@cognite/sdk';

import TimeSeriesSelectorOption from './TimeSeriesSelectorOption/TimeSeriesSelectorOption';
import TimeSeriesSelectorOptionWrapper from './TimeSeriesSelectorOption/TimeSeriesSelectorOptionWrapper';
import {
  getTimeSeriesOptionByExternalId,
  searchForTimeSeriesOptions,
} from './utils';

type TimeSeriesSelectorProps = AutoCompleteProps;

export type DataObject = Timeseries & {
  datapoint?: DoubleDatapoint;
  timestamp?: Date;
  unit?: string;
  datapoints?: DatapointAggregate[];
};

export type Option = OptionType<string> & {
  data?: DataObject;
};

function TimeSeriesSelector({
  disabled,
  name,
  value,
  width,
  onChange,
  title,
}: TimeSeriesSelectorProps) {
  const [selectedValue, setSelectedValue] = useState<Option>();
  const [internalInputValue, setInternalInputValue] = useState('');
  const { client } = useAuthContext();

  const getTimeSeriesDataByExternalId = useCallback(
    async (externalId: string) => {
      if (!client) {
        throw new Error('Cdf error');
      }
      return getTimeSeriesOptionByExternalId(client, externalId);
    },
    [client]
  );

  useEffect(() => {
    const getValue = async () => {
      const item = await getTimeSeriesDataByExternalId(value);
      setSelectedValue(item);
    };
    if (!value) {
      return;
    }
    void getValue();
  }, [value, getTimeSeriesDataByExternalId]);

  const loadOptions = (
    query: string,
    callback: (options: Option[]) => void
  ) => {
    searchForTimeSeriesOptions(query, client).then((resp) => {
      callback(resp);
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedLoad = useCallback(debounce(loadOptions, 500), []);

  const handleSearchInput = (input: string, { action }: InputActionMeta) => {
    // Shouldn't update input value on menu close if still focussed on input
    if (action !== 'menu-close') {
      setInternalInputValue(input);
      return input;
    }
    setInternalInputValue('');
    return '';
  };

  const renderOption = (option: Option) => (
    <TimeSeriesSelectorOption inputValue={internalInputValue} option={option} />
  );

  const handleOnChange = (option: Option, { action }: ActionMeta<Option>) => {
    if (action === 'clear') {
      onChange({ value: undefined });
      setInternalInputValue('');
      setSelectedValue(undefined);
      return;
    }
    onChange(option);
  };

  return (
    <Wrapper className="cogs-input-container" width={width}>
      <div className="title">{title}</div>
      <AutoComplete
        components={{
          DropdownIndicator: () => null,
          IndicatorSeparator: () => null,
          Option: TimeSeriesSelectorOptionWrapper,
        }}
        disabled={disabled}
        inputValue={internalInputValue}
        isDisabled={disabled}
        loadOptions={debouncedLoad}
        mode="async"
        name={name}
        noOptionsMessage={({ inputValue }: { inputValue?: string }) =>
          !inputValue ? 'Type to search' : 'No results'
        }
        openMenuOnClick={false}
        openMenuOnFocus={false}
        placeholder="Type here to search..."
        renderOption={renderOption}
        title={title}
        value={selectedValue}
        width={width}
        blurInputOnSelect
        isClearable
        onChange={handleOnChange}
        onFocus={() => {
          setInternalInputValue(selectedValue?.label ?? value);
        }}
        onInputChange={handleSearchInput}
      />
    </Wrapper>
  );
}

export const Wrapper = styled.div<{ width?: number }>`
  .cogs-select {
    min-width: 220px;
    width: ${(props) => props.width ?? 220}px;
    height: 40px;

    .cogs-select--is-disabled {
      cursor: not-allowed !important;
    }

    & > * .cogs-select__single-value {
      cursor: text;
      line-height: unset;
    }
    & > .cogs-select__control {
      border-radius: 5px;
      transition: 500ms;
      cursor: text;
      .cogs-select__indicators {
        .cogs-select__clear-indicator {
          color: var(--cogs-greyscale-grey6);
          cursor: pointer;
        }
        .cogs-select__clear-indicator:hover {
          color: var(--cogs-midblue-4);
        }
      }
    }
    & > * .cogs-select__menu {
      cursor: pointer;
    }

    & > * .cogs-select__control--is-focused {
      border: 2px solid var(--cogs-primary) !important;
    }
    &:hover .cogs-select__control :not(.cogs-select__control--is-disabled) {
      background-color: var(--cogs-white);
      border: 2px solid var(--cogs-midblue-4) !important;
    }
    &:hover .cogs-select__control.cogs-select__control--is-focused {
      border: 2px solid var(--cogs-primary) !important;
    }
    .cogs-select__control.cogs-select__control--is-focused {
      border: 2px solid var(--cogs-primary) !important;
      & > * .cogs-select__single-value {
        color: var(--cogs-greyscale-grey6);
      }
    }
    .cogs-select__control.cogs-select__control--is-disabled {
      pointer-events: auto;
      border-color: var(--cogs-greyscale-grey5);
      background: var(--cogs-greyscale-grey3);
      cursor: not-allowed !important;

      & > * .cogs-select__single-value {
        cursor: not-allowed;
      }
      & > * .cogs-select__value-container {
        cursor: not-allowed !important;
      }
    }
  }
`;

export default TimeSeriesSelector;
