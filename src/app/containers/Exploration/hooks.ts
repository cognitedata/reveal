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
    history.push(createLink(`/explore/search/${newResourceType}`, { query }));
  };
  return [resourceType, setCurrentResourceType];
};

export const useCurrentResourceId = (): [
  number | undefined,
  (type: number | undefined, replace?: boolean) => void
] => {
  const [type] = useCurrentResourceType();
  const history = useHistory();

  const { id } = useParams<{
    id: string;
  }>();
  const idNumber =
    !!id && Number.isFinite(parseInt(id, 10)) ? parseInt(id, 10) : undefined;

  const setCurrentResourceId = (
    newResourceId?: number,
    replaceHistory: boolean = false
  ) => {
    const { query } = queryString.parse(history.location.search);
    const move = replaceHistory ? history.replace : history.push;
    if (!newResourceId) {
      move(createLink(`/explore/search/${type}`, { query }));
    } else {
      move(createLink(`/explore/search/${type}/${newResourceId}`, { query }));
    }
  };
  return [idNumber, setCurrentResourceId];
};
