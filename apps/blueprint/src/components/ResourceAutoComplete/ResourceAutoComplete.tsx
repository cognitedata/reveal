import { AutoComplete, OptionsType, OptionTypeBase } from '@cognite/cogs.js';
import { Asset, Timeseries } from '@cognite/sdk';
import { FC, useEffect, useState } from 'react';
import { client } from 'utils/sdk';

export type ResourceAutoCompleteProps = {
  placeholder: string;
  resourceType: 'TIMESERIES' | 'ASSET';
  value?: {
    value?: string;
    label?: string;
  };
  defaultValue?: string;
  setSelectedResource: (next: Timeseries | Asset) => void;
};
export const ResourceAutoComplete: FC<ResourceAutoCompleteProps> = ({
  placeholder,
  resourceType,
  value,
  defaultValue,
  setSelectedResource,
}) => {
  const [inputValue, setInputValue] = useState<string | undefined>(
    defaultValue
  );
  const loadOptions = (
    input: string,
    callback: (options: OptionsType<OptionTypeBase>) => void
  ) => {
    if (!input) {
      callback([]);
      return;
    }
    if (resourceType === 'TIMESERIES') {
      client?.timeseries
        .search({ search: { query: input } })
        .then((res) => callback(res.map((r) => ({ label: r.name, value: r }))));
    }
    if (resourceType === 'ASSET') {
      client?.assets
        .search({ search: { query: input } })
        .then((res) => callback(res.map((r) => ({ label: r.name, value: r }))));
    }
  };

  useEffect(() => {
    if (defaultValue) {
      if (resourceType === 'TIMESERIES') {
        client?.timeseries
          .retrieve([{ externalId: defaultValue }])
          .then((res) => setSelectedResource(res[0]));
      }
      if (resourceType === 'ASSET') {
        client?.assets.retrieve([{ externalId: defaultValue }]).then((res) => {
          setSelectedResource(res[0]);
          handleInputChange(res[0].name);
        });
      }
    }
  }, []);

  const handleInputChange = (newValue: string) => {
    const newInputValue = newValue.replace(/\W/g, '');
    setInputValue(newInputValue);
    return newInputValue;
  };

  return (
    <div style={{ width: '100%' }}>
      <AutoComplete
        mode="async"
        placeholder={placeholder}
        value={{
          value: value?.value,
          label: inputValue || value?.label || placeholder,
        }}
        loadOptions={loadOptions}
        handleInputChange={handleInputChange}
        onChange={(next: { value: Timeseries | Asset; label: string }) => {
          setSelectedResource(next.value);
          handleInputChange(next.label);
        }}
      />
    </div>
  );
};
