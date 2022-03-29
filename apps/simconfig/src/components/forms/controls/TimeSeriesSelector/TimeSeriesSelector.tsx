import { useEffect, useState } from 'react';
import type { ActionMeta, InputActionMeta } from 'react-select';
import { useDebounce } from 'react-use';

import styled from 'styled-components/macro';

import { AutoComplete } from '@cognite/cogs.js';
import type { AutoCompleteProps } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';

import TimeseriesSelectorOption from './TimeSeriesSelectorOption';
import TimeseriesSelectorOptionContainer from './TimeSeriesSelectorOptionContainer';
import type { TimeseriesOption } from './types';
import { getTimeseriesOptionByExternalId, timeseriesSearch } from './utils';

interface TimeSeriesSelectorProps extends AutoCompleteProps {
  disabled?: boolean;
  name?: string;
  onChange: (option: Partial<TimeseriesOption>) => void;
  title?: string;
  value: string;
  width?: number;
  window?: number;
  endOffset?: number;
}

function TimeseriesSelector({
  disabled,
  name,
  onChange,
  title,
  value,
  width,
  window = 1440,
  endOffset = 0,
}: TimeSeriesSelectorProps) {
  const [selectedValue, setSelectedValue] = useState<TimeseriesOption>();
  const [queryString, setQueryString] = useState('');
  const [queryResult, setQueryResult] = useState<TimeseriesOption[]>();
  const { client } = useAuthContext();

  useEffect(() => {
    const getValue = async () => {
      if (!client) {
        return;
      }
      const item = await getTimeseriesOptionByExternalId(client, value);
      if (item) {
        setSelectedValue(item);
      }
    };

    if (!value) {
      return;
    }

    void getValue();
  }, [value, client]);

  const [isReady] = useDebounce(
    async () => {
      if (queryString.length < 2) {
        setQueryResult([]);
        return;
      }
      if (!client) {
        return;
      }
      const result = await timeseriesSearch({
        query: queryString,
        client,
        window,
        endOffset,
      });
      setQueryResult(result);
    },
    1000,
    [client, endOffset, queryString, window]
  );

  const handleInputChange = (input: string, { action }: InputActionMeta) => {
    // Shouldn't update input value on menu close if still focused on input
    if (action !== 'menu-close' && input && input !== queryString) {
      setQueryString(input);
      return input;
    }
    setQueryString('');
    return '';
  };

  const renderOption = (option: TimeseriesOption) => (
    <TimeseriesSelectorOption inputValue={queryString} option={option} />
  );

  const handleChange = (
    option: TimeseriesOption,
    { action }: ActionMeta<TimeseriesOption>
  ) => {
    if (action === 'clear') {
      onChange({ value: undefined });
      setQueryString('');
      setSelectedValue(undefined);
      return;
    }
    onChange(option);
  };

  return (
    <TimeseriesSelectorContainer className="cogs-input-container" width={width}>
      <div className="title">{title}</div>
      <AutoComplete
        components={{
          Option: TimeseriesSelectorOptionContainer,
        }}
        disabled={disabled}
        inputValue={queryString}
        isDisabled={disabled}
        isLoading={!isReady()}
        name={name}
        options={queryResult}
        placeholder="Type to search..."
        renderOption={renderOption}
        title={title}
        value={selectedValue}
        width={width}
        blurInputOnSelect
        isClearable
        openMenuOnClick
        openMenuOnFocus
        onChange={handleChange}
        onFocus={() => {
          setQueryString(selectedValue?.label ?? value);
        }}
        onInputChange={handleInputChange}
      />
    </TimeseriesSelectorContainer>
  );
}

export const TimeseriesSelectorContainer = styled.div<{ width?: number }>`
  .cogs-select {
    min-width: 220px;
    width: ${(props) => props.width ?? 220}px;
  }
`;

export default TimeseriesSelector;
