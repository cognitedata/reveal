import React, { useEffect, useState } from 'react';

import debounce from 'lodash/debounce';

import { StringFilter } from '@cognite/data-exploration';

import { VisionFilterItemProps } from '../../types';

const DEBOUNCE_TIME = 200;

export const SourceFilter = ({ filter, setFilter }: VisionFilterItemProps) => {
  const [sourceInput, setSourceInput] = useState<string | undefined>();

  const debouncedSetFilter = debounce(setFilter, DEBOUNCE_TIME);

  const handleSourceInputChange = (newValue: string | undefined) => {
    setSourceInput(newValue);
    debouncedSetFilter({
      ...filter,
      source: newValue,
    });
  };

  // Reset source input when source filter is cleared
  useEffect(() => {
    if (filter.source === undefined) {
      setSourceInput(undefined);
    }
  }, [filter.source]);

  return (
    <StringFilter
      title="Source"
      placeholder="Exact match..."
      value={sourceInput}
      setValue={handleSourceInputChange}
    />
  );
};
