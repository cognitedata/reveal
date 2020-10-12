import React, { useCallback, useContext } from 'react';
import ResourceSelectionContext, {
  useResourceFilter,
} from 'context/ResourceSelectionContext';
import { ResourceType } from 'types';
import { Title, Input } from '@cognite/cogs.js';

export const ExternalIDPrefixFilter = ({
  resourceType,
}: {
  resourceType: ResourceType;
}) => {
  const filter = useResourceFilter(resourceType);
  const currentExternalIdPrefix = filter?.externalIdPrefix || '';

  const {
    setSequenceFilter,
    setAssetFilter,
    setFileFilter,
    setEventFilter,
    setTimeseriesFilter,
  } = useContext(ResourceSelectionContext);

  const setExternalIdPrefix = useCallback(
    (value: string) => {
      switch (resourceType) {
        case 'asset':
          setAssetFilter(currentFilter => ({
            ...currentFilter,
            externalIdPrefix: value,
          }));
          break;
        case 'timeSeries':
          setTimeseriesFilter(currentFilter => ({
            ...currentFilter,
            externalIdPrefix: value,
          }));
          break;
        case 'event':
          setEventFilter(currentFilter => ({
            ...currentFilter,
            externalIdPrefix: value,
          }));
          break;
        case 'file':
          setFileFilter(currentFilter => ({
            ...currentFilter,
            externalIdPrefix: value,
          }));
          break;
        case 'sequence':
          setSequenceFilter(currentFilter => ({
            ...currentFilter,
            externalIdPrefix: value,
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
        External ID
      </Title>
      <Input
        variant="noBorder"
        style={{ width: '100%' }}
        value={currentExternalIdPrefix}
        placeholder="Starts with..."
        onChange={ev => setExternalIdPrefix(ev.target.value)}
      />
    </>
  );
};
