import { StringFilter } from '@cognite/data-exploration';
import React, { useEffect, useState } from 'react';
import { VisionFilterItemProps } from 'src/modules/FilterSidePanel/types';

export const SourceFilter = ({ filter, setFilter }: VisionFilterItemProps) => {
  const [sourceInput, setSourceInput] = useState<string | undefined>();

  useEffect(() => {
    setFilter({
      ...filter,
      source: sourceInput,
    });
  }, [sourceInput]);

  return (
    <StringFilter
      title="Source"
      placeholder="Exact match"
      value={sourceInput}
      setValue={setSourceInput}
    />
  );
};
