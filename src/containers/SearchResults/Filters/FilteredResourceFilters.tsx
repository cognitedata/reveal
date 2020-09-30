import React from 'react';
import { ResourceType } from 'types';

import { useResourceFilter } from 'context';
import ResourceFilters from './ResourceFilters';

// MUST DO: remove set/get current type prop drilling
type Props = {
  currentResourceType: ResourceType;
  setCurrentResourceType: (newResourceType: ResourceType) => void;
};
export default function FilteredResourceFilters({
  currentResourceType,
  setCurrentResourceType,
}: Props) {
  const filter = useResourceFilter(currentResourceType);

  return (
    <ResourceFilters
      filter={filter}
      currentResourceType={currentResourceType}
      setCurrentResourceType={setCurrentResourceType}
    />
  );
}
