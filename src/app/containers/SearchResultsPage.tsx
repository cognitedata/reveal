import React, { useEffect, useRef } from 'react';
import queryString from 'query-string';
import { ResourceType } from 'lib/types';
import { useHistory, useParams } from 'react-router-dom';
import { SearchResults } from 'lib/containers/SearchResults';
import { createLink } from '@cognite/cdf-utilities';
import { trackUsage, Timer, trackTimedUsage } from 'app/utils/Metrics';
import {
  useResourceFilter,
  useQuery,
  useResourcesState,
} from 'lib/context/ResourceSelectionContext';

export const SearchResultsPage = () => {
  const history = useHistory();

  const setCurrentResourceType = (newResourceType: ResourceType) => {
    const { query } = queryString.parse(history.location.search);
    if (typeof query === 'string') {
      history.push(createLink(`/explore/${newResourceType}?query=${query}`));
    } else {
      history.push(createLink(`/explore/${newResourceType}`));
    }
  };

  const { resourceType = 'asset' } = useParams<{
    resourceType: ResourceType;
  }>();

  const [query] = useQuery();
  const filter = useResourceFilter(resourceType);
  const { resourcesState } = useResourcesState();

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
    const activeResource = resourcesState.find(
      resource => resource.state === 'active' && resource.type === resourceType
    );

    if (activeResource) {
      trackUsage('Exploration.PreviewResource', activeResource);
      if (timer.current) {
        timer.current.stop({
          type: activeResource.type,
          id: activeResource.id,
        });
      }
    } else {
      timer.current = trackTimedUsage('Exploration.SearchTime');
    }

    return () => timer.current?.stop();
  }, [resourcesState, resourceType]);

  return (
    <SearchResults
      setCurrentResourceType={setCurrentResourceType}
      currentResourceType={resourceType}
    />
  );
};
