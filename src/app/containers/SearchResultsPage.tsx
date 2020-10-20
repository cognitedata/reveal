import React from 'react';
import { ResourceType } from 'lib/types';
import { useHistory, useParams } from 'react-router-dom';
import { SearchResults } from 'lib/containers/SearchResults';
import { createLink } from '@cognite/cdf-utilities';

export const SearchResultsPage = () => {
  const history = useHistory();

  const setCurrentResourceType = (newResourceType: ResourceType) => {
    history.push(createLink(`/explore/${newResourceType}`));
  };

  const { resourceType = 'asset' } = useParams<{
    resourceType: ResourceType;
  }>();

  return (
    <SearchResults
      setCurrentResourceType={setCurrentResourceType}
      currentResourceType={resourceType}
    />
  );
};
