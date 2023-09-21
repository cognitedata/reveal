import React from 'react';

import styled from 'styled-components';

import { Button } from '@cognite/cogs.js';
import { SpacedRow } from '@cognite/data-exploration';
import {
  FileFilterProps,
  AssetFilterProps,
  LabelContainsAnyFilter,
} from '@cognite/sdk';

import {
  useResourceFilter,
  useSetResourceFilter,
} from '../../context/ResourceSelectionContext';
import { trackUsage } from '../../utils/Metrics';

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
      (l) => l.externalId
    ) || [];

  const setLabel = (label: string) => {
    const newFilters = appliedLabelFilters.includes(label)
      ? appliedLabelFilters.filter((l) => l !== label)
      : [...appliedLabelFilters, label];
    setFilter((prevFilter: FileFilterProps | AssetFilterProps) => ({
      ...prevFilter,
      labels:
        newFilters.length > 0
          ? { containsAny: newFilters.map((l) => ({ externalId: l })) }
          : undefined,
    }));
    trackUsage('Exploration.Filter.PredefinedLabel', { label });
  };

  return (
    <SpacedRow>
      {labels.map((label) => (
        <LabelButton
          key={label}
          size="small"
          type={appliedLabelFilters.includes(label) ? 'primary' : 'tertiary'}
          onClick={() => setLabel(label)}
        >
          {label}
        </LabelButton>
      ))}
    </SpacedRow>
  );
};

const LabelButton = styled(Button)`
  :not(:last-child) {
    margin-right: 8px;
  }
`;
