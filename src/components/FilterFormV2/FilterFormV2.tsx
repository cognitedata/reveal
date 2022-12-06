import React, { useState, useEffect } from 'react';
import { Select } from 'components';

import styled from 'styled-components';
import { useAssetMetadataValues } from 'hooks/MetadataAggregateHooks';
import { reactSelectCogsStylingProps } from 'components/SearchNew/Filters/elements';
import { FilterChip } from 'components/AppliedFiltersTags/FilterChip';
import { DISABLE_VALUE_TOOLTIP } from './constants';
import { Tooltip } from '@cognite/cogs.js';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const FilterItemWrapper = styled.div`
  .key {
    margin-bottom: 16px;
  }
  .key,
  .value {
    display: flex;
    flex: 1;
    > div {
      flex: 1;
    }
  }
  .buttons {
    display: flex;
    align-items: stretch;
    > * {
      margin-left: 4px;
    }
  }
`;

const FilterItem = ({
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
  const [selectedKey, setSelectedKey] = useState<string | null>();
  const [selectedValue, setSelectedValue] = useState<string | null>();
  useEffect(() => {
    if (initialKey) {
      setSelectedKey(initialKey);
    }
  }, [initialKey]);
  useEffect(() => {
    if (initialValue) {
      setSelectedValue(initialValue);
    }
  }, [initialValue]);

  const allowEdit =
    selectedKey &&
    selectedValue &&
    (selectedKey !== initialKey || selectedValue !== initialValue);
  useEffect(() => {
    if (allowEdit) {
      setFilter(selectedKey, selectedValue);
      setSelectedKey(undefined);
      setSelectedValue(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey, selectedValue, allowEdit]);

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
        }))
      : metadata[key]?.map(el => ({ label: el, value: el }));

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
              setSelectedKey(
                item ? (item as { value: string }).value : undefined
              );
              setSelectedValue(undefined);
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
              isDisabled={!selectedKey}
              value={
                selectedValue
                  ? { label: selectedValue, value: selectedValue }
                  : undefined
              }
              onChange={item => {
                setSelectedValue(item?.value || undefined);
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

export type FilterFormProps = {
  metadata: {
    [key: string]: string[];
  };
  keys?: {
    value: string;
    count: number;
  }[];
  filters?: {
    key: string;
    value: string;
  }[];
  metadataCategory?: {
    [key: string]: string;
  };
  lockedFilters?: string[];
  setFilters: (filter: { key: string; value: string }[]) => void;
  useAggregates?: boolean;
};

// NOTE: This component is super confusing and complicated. Subject to refactoring.
export const FilterFormV2 = ({
  metadata,
  keys,
  metadataCategory = {},
  filters = [],
  lockedFilters = [],
  setFilters = () => {},
  useAggregates = false,
}: FilterFormProps) => {
  const [editingKeys, setEditingKeys] = useState<string[]>([]);

  const allKeys = new Set<{
    value: string;
    count?: number;
  }>();

  if (keys && keys.length > 0) {
    keys.forEach(el => allKeys.add(el));
  } else {
    Object.keys(metadataCategory).forEach(el => allKeys.add({ value: el }));
    Object.keys(metadata).forEach(el => allKeys.add({ value: el }));
  }

  const categories = [...allKeys].reduce(
    (prev, el) => {
      if (!prev[metadataCategory[el.value]]) {
        prev[metadataCategory[el.value] || 'undefined'] = [];
      }
      prev[metadataCategory[el.value] || 'undefined'].push(el);
      return prev;
    },
    {} as {
      [key: string]: {
        value: string;
        count?: number;
      }[];
    }
  );

  const handleSetMetadataFilter = (newKey: string, newValue: string) => {
    const hasFilterApplied = filters.some(
      ({ key, value }) => key === newKey && value === newValue
    );

    if (hasFilterApplied) {
      return;
    }
    const hasSameKeyIndex = filters.findIndex(({ key }) => key === newKey);
    if (hasSameKeyIndex !== -1) {
      const removedFilters = [...filters].splice(hasSameKeyIndex, 1, {
        key: newKey,
        value: newValue,
      });
      setFilters(removedFilters);
    } else {
      setFilters([...filters, { key: newKey, value: newValue }]);
    }
  };

  const handleRemoveMetadataFilter = (key: string) => {
    const newFilter = filters?.filter(filter => filter.key !== key);
    setFilters(newFilter);
  };

  return (
    <Wrapper>
      {filters
        .filter(({ key }) => editingKeys.includes(key))
        .map(({ key, value }) => (
          <FilterItem
            key={key}
            categories={categories}
            lockedFilters={lockedFilters}
            metadata={metadata}
            initialKey={key}
            initialValue={value}
            setFilter={(newKey, newValue) => {
              handleSetMetadataFilter(newKey, newValue);
              setEditingKeys(editingKeys.filter(el => el !== key));
            }}
          />
        ))}
      <FilterItem
        key="add"
        metadata={metadata}
        categories={categories}
        lockedFilters={lockedFilters}
        setFilter={(newKey, newValue) => {
          handleSetMetadataFilter(newKey, newValue);
        }}
        useAggregates={useAggregates}
      />
      <Tags>
        {filters.map(({ key, value }) => {
          return (
            <FilterChip
              name={key}
              key={value}
              value={value}
              onClick={() => {
                handleRemoveMetadataFilter(key);
              }}
              formatName={false}
            />
          );
        })}
      </Tags>
    </Wrapper>
  );
};
