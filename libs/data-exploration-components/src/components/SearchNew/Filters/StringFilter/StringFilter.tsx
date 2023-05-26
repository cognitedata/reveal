import React from 'react';

import {
  DATA_EXPLORATION_COMPONENT,
  useDebounceTrackUsage,
} from '@data-exploration-lib/core';

import { Input } from '@cognite/cogs.js';

import { FilterFacetTitle } from '../FilterFacetTitle';

export const StringFilterV2 = ({
  value,
  setValue,
  title,
  placeholder = 'Starts with...',
}: {
  title: string;
  placeholder?: string;
  value: string | undefined;
  setValue: (newValue: string | undefined) => void;
}) => {
  const track = useDebounceTrackUsage();

  const setNewString = (newValue: string | undefined) => {
    setValue(newValue && newValue.length > 0 ? newValue : undefined);
  };

  return (
    <>
      <FilterFacetTitle>{title}</FilterFacetTitle>
      <Input
        variant="noBorder"
        style={{
          width: '100%',
        }}
        value={value || ''}
        placeholder={placeholder}
        onChange={(ev) => {
          setNewString(ev.target.value);
          track(DATA_EXPLORATION_COMPONENT.INPUT.TEXT_FILTER, {
            value: ev.target.value,
            title,
          });
        }}
      />
    </>
  );
};
