import React from 'react';
import {
  useResourceFilter,
  useSetResourceFilter,
} from 'app/context/ResourceSelectionContext';
import { useList } from '@cognite/sdk-react-query-hooks';
import { LabelDefinition } from '@cognite/sdk';
import { usePermissions } from 'lib/hooks/CustomHooks';
import { Button } from '@cognite/cogs.js';
import { useCurrentResourceType } from 'app/hooks';
import uniqBy from 'lodash/uniqBy';
import { SpacedRow } from 'lib';

export const LabelsQuickSelect = () => {
  const [currentResourceType] = useCurrentResourceType();
  const filter = useResourceFilter(currentResourceType);
  const setFilter = useSetResourceFilter(currentResourceType);

  const hasPermission = usePermissions('labelsAcl', 'READ');
  const { data: labels = [] } = useList<LabelDefinition>(
    'labels',
    { filter: {} },
    {
      enabled: hasPermission,
    },
    true
  );

  // @ts-ignore
  const value = ((filter as any).labels || { containsAny: [] }).containsAny;

  const currentLabels = ((value as { externalId: string }[]) || [])
    .map(({ externalId }) => labels.find(el => el.externalId === externalId))
    .filter(el => !!el) as LabelDefinition[];

  const setLabel = (ids?: string[]) => {
    const newFilters =
      ids && ids.length > 0
        ? ids.map(externalId => ({ externalId }))
        : undefined;
    setFilter((prevFilter: any) => ({
      ...prevFilter,
      labels: newFilters ? { containsAny: newFilters } : undefined,
    }));
  };
  if (currentResourceType !== 'asset' && currentResourceType !== 'file') {
    return null;
  }

  return (
    <SpacedRow>
      {uniqBy(currentLabels.concat(labels), el => el.externalId).map(label => {
        const items = currentLabels.filter(
          el => el.externalId !== label.externalId
        );
        const isActive = items.length !== currentLabels.length;
        return (
          <Button
            key={label.externalId}
            size="small"
            type="primary"
            variant={isActive ? 'default' : 'outline'}
            onClick={() => {
              if (isActive) {
                setLabel(items.map(el => el.externalId));
              } else {
                setLabel([...items, label].map(el => el.externalId));
              }
            }}
          >
            {label.name}
          </Button>
        );
      })}
    </SpacedRow>
  );
};
