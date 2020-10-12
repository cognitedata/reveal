import React, { useCallback, useContext } from 'react';
import { Asset, FileInfo, CogniteEvent } from '@cognite/sdk';
import { ResourceSelectionContext, useResourceFilter } from 'context';
import { Select } from 'components/Common';
import { Title } from '@cognite/cogs.js';
import { ResourceType } from 'types';

export const SourceFilter = ({
  items,
  resourceType,
}: {
  resourceType: ResourceType;
  items: (Asset | FileInfo | CogniteEvent)[];
}) => {
  const filter = useResourceFilter(resourceType);
  const currentSource = (filter as any)?.source;

  const { setAssetFilter, setFileFilter, setEventFilter } = useContext(
    ResourceSelectionContext
  );

  const setSource = useCallback(
    (value?: string) => {
      const newSource = value && value.length > 0 ? value : undefined;
      switch (resourceType) {
        case 'asset':
          setAssetFilter(currentFilter => ({
            ...currentFilter,
            source: newSource,
          }));
          break;
        case 'event':
          setEventFilter(currentFilter => ({
            ...currentFilter,
            source: newSource,
          }));
          break;
        case 'file':
          setFileFilter(currentFilter => ({
            ...currentFilter,
            source: newSource,
          }));
          break;
      }
    },
    [resourceType, setAssetFilter, setEventFilter, setFileFilter]
  );

  const sources: Set<string> = new Set();
  items.forEach(el => {
    if (el.source) {
      sources.add(el.source);
    }
  });

  return (
    <>
      <Title level={4} style={{ marginBottom: 12 }} className="title">
        Source
      </Title>
      <Select
        creatable
        value={
          currentSource
            ? { value: currentSource, label: currentSource }
            : undefined
        }
        onChange={item => {
          if (item) {
            setSource((item as { value: string }).value);
          } else {
            setSource(undefined);
          }
        }}
        options={[...sources].map(el => {
          return {
            value: el,
            label: el,
          };
        })}
      />
    </>
  );
};
