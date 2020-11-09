import queryString from 'query-string';
import { useParams, useHistory } from 'react-router-dom';
import { ResourceType } from 'lib';
import { createLink } from '@cognite/cdf-utilities';

export const useCurrentResourceType = (): [
  ResourceType,
  (type: ResourceType) => void
] => {
  const history = useHistory();

  const { resourceType = 'asset' } = useParams<{
    resourceType: ResourceType;
  }>();
  const setCurrentResourceType = (newResourceType: ResourceType) => {
    const { query } = queryString.parse(history.location.search);
    history.push(createLink(`/explore/${newResourceType}`, { query }));
  };
  return [resourceType, setCurrentResourceType];
};
