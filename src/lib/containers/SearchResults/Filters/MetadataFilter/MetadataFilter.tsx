import React, { useCallback, useContext, useMemo } from 'react';
import { Title } from '@cognite/cogs.js';
import { FilterForm } from 'lib/components';
import { ResourceSelectionContext } from 'lib/context';
import { ResourceType } from 'lib/types';

export const MetadataFilter = <
  T extends { metadata?: { [key: string]: string } }
>({
  items,
  resourceType,
}: {
  items: T[];
  resourceType: ResourceType;
}) => {
  const {
    sequenceFilter,
    setSequenceFilter,
    assetFilter,
    setAssetFilter,
    fileFilter,
    setFileFilter,
    eventFilter,
    setEventFilter,
    timeseriesFilter,
    setTimeseriesFilter,
  } = useContext(ResourceSelectionContext);

  const tmpMetadata = items.reduce((prev, el) => {
    Object.keys(el.metadata || {}).forEach(key => {
      if (el.metadata![key].length !== 0) {
        if (!prev[key]) {
          prev[key] = new Set<string>();
        }
        prev[key].add(el.metadata![key]);
      }
    });
    return prev;
  }, {} as { [key: string]: Set<string> });

  const metadata = Object.keys(tmpMetadata).reduce((prev, key) => {
    prev[key] = [...tmpMetadata[key]];
    return prev;
  }, {} as { [key: string]: string[] });

  const filters = useMemo(() => {
    switch (resourceType) {
      case 'asset':
        return (assetFilter || {}).metadata;
      case 'timeSeries':
        return (timeseriesFilter || {}).metadata;
      case 'file':
        return (fileFilter || {}).metadata;
      case 'event':
        return (eventFilter || {}).metadata;
      case 'sequence':
        return (sequenceFilter || {}).metadata;
    }
    return {};
  }, [
    resourceType,
    assetFilter,
    timeseriesFilter,
    fileFilter,
    eventFilter,
    sequenceFilter,
  ]);

  const setFilter = useCallback(
    (newFilters: { [key: string]: string }) => {
      switch (resourceType) {
        case 'asset':
          setAssetFilter(currentFilter => ({
            ...currentFilter,
            metadata: newFilters,
          }));
          break;
        case 'timeSeries':
          setTimeseriesFilter(currentFilter => ({
            ...currentFilter,
            metadata: newFilters,
          }));
          break;
        case 'event':
          setEventFilter(currentFilter => ({
            ...currentFilter,
            metadata: newFilters,
          }));
          break;
        case 'file':
          setFileFilter(currentFilter => ({
            ...currentFilter,
            metadata: newFilters,
          }));
          break;
        case 'sequence':
          setSequenceFilter(currentFilter => ({
            ...currentFilter,
            metadata: newFilters,
          }));
      }
    },
    [
      resourceType,
      setAssetFilter,
      setTimeseriesFilter,
      setEventFilter,
      setFileFilter,
      setSequenceFilter,
    ]
  );

  return (
    <>
      <Title level={4} style={{ marginBottom: 12 }} className="title">
        Metadata filters
      </Title>
      <FilterForm
        metadata={metadata}
        filters={filters}
        setFilters={setFilter}
      />
    </>
  );
};
