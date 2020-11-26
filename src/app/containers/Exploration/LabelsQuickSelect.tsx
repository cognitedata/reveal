import React from 'react';
import {
  useResourceFilter,
  useSetResourceFilter,
} from 'app/context/ResourceSelectionContext';
import {
  FileFilterProps,
  AssetFilterProps,
  LabelContainsAnyFilter,
} from '@cognite/sdk';
import { Button } from '@cognite/cogs.js';
import { SpacedRow } from 'lib';

export const LabelsQuickSelect = ({ type }: { type: 'file' | 'asset' }) => {
  const filter = useResourceFilter(type) as FileFilterProps | AssetFilterProps;
  const setFilter = useSetResourceFilter(type);

  const preselectedLabels: { [k: string]: string[] } = {
    file: ['Engineering Diagram', 'P&ID', 'Manual'],
  };
  const labels = preselectedLabels[type];

  if (!labels || labels.length === 0) {
    return null;
  }

  const appliedLabelFilters =
    (filter.labels as LabelContainsAnyFilter)?.containsAny.map(
      l => l.externalId
    ) || [];

  const setLabel = (label: string) => {
    const newFilters = appliedLabelFilters.includes(label)
      ? appliedLabelFilters.filter(l => l !== label)
      : [...appliedLabelFilters, label];
    setFilter((prevFilter: FileFilterProps | AssetFilterProps) => ({
      ...prevFilter,
      labels:
        newFilters.length > 0
          ? { containsAny: newFilters.map(l => ({ externalId: l })) }
          : undefined,
    }));
  };

  return (
    <SpacedRow>
      {labels.map(label => (
        <Button
          key={label}
          size="small"
          type="primary"
          variant={appliedLabelFilters.includes(label) ? 'default' : 'outline'}
          onClick={() => setLabel(label)}
        >
          {label}
        </Button>
      ))}
    </SpacedRow>
  );
};
