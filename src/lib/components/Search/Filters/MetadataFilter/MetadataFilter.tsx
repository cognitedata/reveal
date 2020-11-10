import React from 'react';
import { Title } from '@cognite/cogs.js';
import { FilterForm } from 'lib/components';

export const MetadataFilter = <
  T extends { metadata?: { [key: string]: string } }
>({
  items,
  value,
  setValue,
}: {
  items: T[];
  value: { [key in string]: string } | undefined;
  setValue: (newValue: { [key in string]: string } | undefined) => void;
}) => {
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

  const setFilter = (newFilters: { [key: string]: string }) => {
    setValue(newFilters);
  };

  return (
    <>
      <Title level={4} style={{ marginBottom: 12 }} className="title">
        Metadata filters
      </Title>
      <FilterForm metadata={metadata} filters={value} setFilters={setFilter} />
    </>
  );
};
