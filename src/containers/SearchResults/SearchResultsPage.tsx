import React from 'react';
import { ResourceType } from 'types';
import { useHistory, useParams } from 'react-router-dom';
import { SearchResults } from 'containers/SearchResults';
import { createLink } from 'utils/URLUtils';

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
