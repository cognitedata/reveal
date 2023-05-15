import { FilterChip } from '@data-exploration/containers';
import React, { useState } from 'react';

import { FilterItem } from './FilterItem';
import { Tags, Wrapper } from './elements';

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
  useAggregateMetadataValues?: (key?: string | null) => {
    data: any;
    isFetching: boolean;
    isFetched: boolean;
  };
};

// NOTE: This component is super confusing and complicated. Subject to refactoring.
export const FilterFormV2 = ({
  metadata,
  keys,
  metadataCategory = {},
  filters = [],
  lockedFilters = [],
  setFilters = () => {},
  useAggregateMetadataValues,
}: FilterFormProps) => {
  const [editingKeys, setEditingKeys] = useState<string[]>([]);

  const allKeys = new Set<{
    value: string;
    count?: number;
  }>();

  if (keys && keys.length > 0) {
    keys.forEach((el) => allKeys.add(el));
  } else {
    Object.keys(metadataCategory).forEach((el) => allKeys.add({ value: el }));
    Object.keys(metadata).forEach((el) => allKeys.add({ value: el }));
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
    const newFilter = filters?.filter((filter) => filter.key !== key);
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
              setEditingKeys(editingKeys.filter((el) => el !== key));
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
        useAggregateMetadataValues={useAggregateMetadataValues}
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
