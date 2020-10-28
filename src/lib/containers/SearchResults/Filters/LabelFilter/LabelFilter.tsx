import React, { useCallback, useContext } from 'react';
import { Title, Tooltip } from '@cognite/cogs.js';
import { LabelDefinition } from '@cognite/sdk';
import { OptionsType, OptionTypeBase } from 'react-select';
import { Select } from 'lib/components';
import { ResourceSelectionContext, useResourceFilter } from 'lib/context';
import { ResourceType } from 'lib/types';
import { useList } from '@cognite/sdk-react-query-hooks';
import { usePermissions } from 'lib/hooks/CustomHooks';

export const LabelFilter = ({
  resourceType,
}: {
  resourceType: ResourceType;
}) => {
  const hasPermission = usePermissions('labelsAcl', 'READ');
  const filter = useResourceFilter(resourceType);
  const allowLabels = resourceType === 'asset' || resourceType === 'file';
  const currentLabelIds: { externalId: string }[] = allowLabels
    ? ((filter as any).labels || { containsAny: [] }).containsAny
    : [];
  const { data: labels = [] } = useList<LabelDefinition>(
    'labels',
    { filter: {} },
    {
      enabled: hasPermission,
    },
    true
  );

  const currentLabels = currentLabelIds
    .map(({ externalId }) => labels.find(el => el.externalId === externalId))
    .filter(el => !!el) as LabelDefinition[];

  const { setAssetFilter, setFileFilter } = useContext(
    ResourceSelectionContext
  );

  const setLabel = useCallback(
    (ids?: string[]) => {
      const newFilters =
        ids && ids.length > 0
          ? ids.map(externalId => ({ externalId }))
          : undefined;
      switch (resourceType) {
        case 'asset':
          setAssetFilter(currentFilter => ({
            ...currentFilter,
            labels: newFilters ? { containsAny: newFilters } : undefined,
          }));
          break;
        // case 'timeSeries':
        //   setTimeseriesFilter(currentFilter => ({
        //     ...currentFilter,
        //     labels: newFilters ? { containsAny: newFilters } : undefined,
        //   }));
        //   break;
        // case 'event':
        //   setEventFilter(currentFilter => ({
        //     ...currentFilter,
        //     labels: newFilters ? { containsAny: newFilters } : undefined,
        //   }));
        //   break;
        case 'file':
          setFileFilter(currentFilter => ({
            ...currentFilter,
            labels: newFilters ? { containsAny: newFilters } : undefined,
          }));
          break;
        // case 'sequence':
        //   setSequenceFilter(currentFilter => ({
        //     ...currentFilter,
        //     labels: newFilters ? { containsAny: newFilters } : undefined,
        //   }));
      }
    },
    [resourceType, setAssetFilter, setFileFilter]
  );

  return (
    <Tooltip
      interactive
      disabled={hasPermission}
      content="You do not have access to labels, please make sure you have labelsAcl:READ"
    >
      <>
        <Title level={4} style={{ marginBottom: 12 }} className="title">
          Labels
        </Title>
        <Select
          options={labels.map(el => ({
            label: el.name,
            value: el.externalId,
          }))}
          isDisabled={!hasPermission || !allowLabels}
          onChange={value => {
            setLabel(
              value
                ? (value as OptionsType<OptionTypeBase>).map(el => el.value)
                : undefined
            );
          }}
          value={currentLabels?.map(el => ({
            label: el.name,
            value: el.externalId,
          }))}
          isMulti
          isSearchable
          isClearable
        />
      </>
    </Tooltip>
  );
};
