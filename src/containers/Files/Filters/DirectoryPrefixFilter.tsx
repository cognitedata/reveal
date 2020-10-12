import React, { useCallback, useContext } from 'react';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { Title, Input } from '@cognite/cogs.js';

export const DirectoryPrefixFilter = () => {
  const { fileFilter, setFileFilter } = useContext(ResourceSelectionContext);
  // @ts-ignore
  const currentDirectoryPrefix = fileFilter?.directoryPrefix || '';

  const setDirectoryPrefix = useCallback(
    (value: string) => {
      setFileFilter(currentFilter => ({
        ...currentFilter,
        directoryPrefix: value,
      }));
    },
    [setFileFilter]
  );

  return (
    <>
      <Title level={4} style={{ marginBottom: 12 }} className="title">
        Directory prefix
      </Title>
      <Input
        variant="noBorder"
        style={{ width: '100%' }}
        value={currentDirectoryPrefix}
        placeholder="Enter path..."
        onChange={ev => setDirectoryPrefix(ev.target.value)}
      />
    </>
  );
};
