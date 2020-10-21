import React, { useEffect, useRef } from 'react';
import { ResourceType } from 'lib/types';
import { useHistory, useParams } from 'react-router-dom';
import { SearchResults } from 'lib/containers/SearchResults';
import { createLink } from '@cognite/cdf-utilities';
import { trackUsage, Timer, trackTimedUsage } from 'app/utils/Metrics';
import {
  useResourceFilter,
  useQuery,
  useSelectedResource,
} from 'lib/context/ResourceSelectionContext';

export const SearchResultsPage = () => {
  const history = useHistory();

  const setCurrentResourceType = (newResourceType: ResourceType) => {
    history.push(createLink(`/explore/${newResourceType}`));
  };

  const { resourceType = 'asset' } = useParams<{
    resourceType: ResourceType;
  }>();

  const [query] = useQuery();
  const filter = useResourceFilter(resourceType);
  const { selectedResource } = useSelectedResource();

  useEffect(() => {
    trackUsage('Exploration.ResourceType', { resourceType });
  }, [resourceType]);

  useEffect(() => {
    trackUsage('Exploration.Filter', { resourceType, filter });
  }, [resourceType, filter]);

  useEffect(() => {
    if (query) {
      trackUsage('Exploration.Query', { query });
    }
  }, [query]);

  const timer = useRef<Timer>();

  useEffect(() => {
    if (selectedResource) {
      trackUsage('Exploration.PreviewResource', selectedResource);
      if (timer.current) {
        timer.current.stop({
          type: selectedResource.type,
          id: selectedResource.id,
        });
      }
    } else {
      timer.current = trackTimedUsage('Exploration.SearchTime');
    }

    return () => timer.current?.stop();
  }, [selectedResource]);

  return (
    <SearchResults
      setCurrentResourceType={setCurrentResourceType}
      currentResourceType={resourceType}
    />
  );
};
