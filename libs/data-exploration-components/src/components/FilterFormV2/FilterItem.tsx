import * as React from 'react';
import { Select } from 'components';
import { useAssetMetadataValues } from 'hooks/MetadataAggregateHooks';
import { reactSelectCogsStylingProps } from 'components/SearchNew/Filters/elements';
import { DISABLE_VALUE_TOOLTIP } from './constants';
import { Tooltip } from '@cognite/cogs.js';
import { FilterItemWrapper } from './elements';

export const FilterItem = ({
  metadata,
  categories,
  lockedFilters,
  setFilter,
  initialKey,
  initialValue,
  useAggregates = false,
}: {
  metadata: {
    [key: string]: string[];
  };
  lockedFilters: string[];
  categories: {
    [key: string]: {
      value: string;
      count?: number;
    }[];
  };
  setFilter: (selectedKey: string, selectedValue: string) => void;

  initialKey?: string;
  initialValue?: string;
  useAggregates?: boolean;
}) => {
  const [selectedKey, setSelectedKey] = React.useState<string | null>();
  const [selectedValue, setSelectedValue] = React.useState<string | null>();

  React.useEffect(() => {
    if (initialKey) {
      setSelectedKey(initialKey);
    }
  }, [initialKey]);
  React.useEffect(() => {
    if (initialValue) {
      setSelectedValue(initialValue);
    }
  }, [initialValue]);

  const {
    data: metadataValues = [],
    isFetching,
    isFetched,
  } = useAssetMetadataValues(selectedKey || null, {
    enabled: useAggregates && !!selectedKey,
  });

  const options = Object.keys(categories)
    .sort((a, b) => {
      if (a === 'undefined') {
        return -1;
      }
      if (b === 'undefined') {
        return 1;
      }
      return a.localeCompare(b);
    })
    .map(category => ({
      label: category,
      options: categories[category].map(el => ({
        label: `${el.value} ${el.count ? `(${el.count})` : ''}`,
        value: el.value,
        disabled: lockedFilters.includes(el.value),
      })),
    }));

  const getMetadataValues = (key: string) =>
    useAggregates && isFetched
      ? metadataValues.map((el: any) => ({
          label: `${el.value} (${el.count})`,
          value: el.value,
          disabled: false,
        }))
      : metadata[key]?.map(el => ({ label: el, value: el, disabled: false }));

  return (
    <>
      <FilterItemWrapper>
        <div className="key">
          <Select
            creatable
            {...reactSelectCogsStylingProps}
            styles={{
              menu: style => ({
                ...style,
                width: '100%',
                maxWidth: '320px',
              }),
              ...reactSelectCogsStylingProps.styles,
            }}
            placeholder="Key"
            disabled={!!initialKey}
            value={
              selectedKey
                ? { label: selectedKey, value: selectedKey }
                : undefined
            }
            onChange={item => {
              setSelectedKey(item ? (item as { value: string }).value : null);
              setSelectedValue(null);
            }}
            options={options}
            className="key-select"
          />
        </div>
        <div>
          <Tooltip content={DISABLE_VALUE_TOOLTIP} disabled={!!selectedKey}>
            <Select
              creatable
              {...reactSelectCogsStylingProps}
              styles={{
                menu: style => ({
                  ...style,
                  width: '100%',
                  maxWidth: '320px',
                }),
                ...reactSelectCogsStylingProps.styles,
              }}
              placeholder="Value"
              disabled={!selectedKey}
              value={
                selectedValue
                  ? { label: selectedValue, value: selectedValue }
                  : undefined
              }
              select
              onChange={item => {
                setSelectedValue(item?.value || null);
                if (selectedKey && item.value) {
                  setFilter(selectedKey, item.value);
                  setSelectedKey(null);
                  setSelectedValue(null);
                }
              }}
              options={selectedKey ? getMetadataValues(selectedKey) : []}
              isLoading={isFetching}
              className="value-select"
            />
          </Tooltip>
        </div>
      </FilterItemWrapper>
    </>
  );
};
