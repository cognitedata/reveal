import memoize from 'lodash/memoize';
import uniqueBy from 'lodash/uniqBy';
import qs from 'query-string';
import { useParams, useHistory } from 'react-router-dom';
import { ResourceType } from 'lib';
import { createLink } from '@cognite/cdf-utilities';
import { ANNOTATION_METADATA_PREFIX as PREFIX } from '@cognite/annotations';
import { useCdfItem, useList } from '@cognite/sdk-react-query-hooks';
import { CogniteEvent } from '@cognite/sdk';
import { useMemo } from 'react';
import {
  annotationInteralIdFilter,
  annotationExternalIdFilter,
} from './utils/filters';

import { SEARCH_KEY } from './utils/contants';

const opts: { arrayFormat: 'comma' } = { arrayFormat: 'comma' };

const getSetItems = memoize(
  (key: string, push: boolean, history: ReturnType<typeof useHistory>) => (
    newItems: string | string[] | undefined
  ) => {
    const search = qs.parse(history?.location?.search, opts);
    history[push ? 'push' : 'replace']({
      pathname: history?.location?.pathname,
      search: qs.stringify(
        {
          ...search,
          [key]: newItems,
        },
        opts
      ),
    });
  }
);

export function useQueryString(
  key: string,
  push = true
): [string, (_: string) => void] {
  const history = useHistory();

  const search = qs.parse(history?.location?.search, opts);
  const item = (search[key] || '') as string;

  return [item, getSetItems(key, push, history)];
}

const emptyArray = [] as string[];
export function useQueryStringArray(
  key: string,
  push: boolean = true
): [string[], (_: any[]) => void] {
  const history = useHistory();

  const search = qs.parse(history?.location?.search, opts);
  const rawItems = search[key];
  if (!rawItems) {
    return [emptyArray, getSetItems(key, push, history)];
  }
  const items = Array.isArray(rawItems) ? rawItems : [rawItems];

  return [items, getSetItems(key, push, history)];
}

export const useCurrentResourceType = (): [
  ResourceType,
  (type: ResourceType) => void
] => {
  const history = useHistory();

  const { resourceType = 'asset' } = useParams<{
    resourceType: ResourceType;
  }>();
  const setCurrentResourceType = (newResourceType: ResourceType) => {
    const query = qs.parse(history.location.search, opts)[SEARCH_KEY];
    history.push(
      createLink(
        `/explore/search/${newResourceType}`,
        {
          [SEARCH_KEY]: query,
        },
        opts
      )
    );
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
    const search = qs.parse(history.location.search, opts);
    const move = replaceHistory ? history.replace : history.push;
    if (!newResourceId) {
      move(createLink(`/explore/search/${type}`, search, opts));
    } else {
      move(
        createLink(`/explore/search/${type}/${newResourceId}`, search, opts)
      );
    }
  };
  return [idNumber, setCurrentResourceId];
};

export const useAnnotations = (fileId: number, resourceType?: ResourceType) => {
  const { data: file = {} } = useCdfItem<{ externalId?: string }>('files', {
    id: fileId,
  });

  const byInternalId = useList<CogniteEvent>('events', {
    filter: annotationInteralIdFilter(fileId, resourceType),
  });

  const byExternalId = useList<CogniteEvent>(
    'events',
    {
      filter: annotationExternalIdFilter(file.externalId!, resourceType),
    },
    { enabled: !!file.externalId }
  );

  const annotations = useMemo(
    () =>
      uniqueBy(
        [...(byExternalId.data || []), ...(byInternalId.data || [])].filter(
          ({ metadata = {} }) => metadata[`${PREFIX}_status`] !== 'deleted'
        ),
        'metadata.CDF_ANNOTATION_box'
      ),
    [byInternalId.data, byExternalId.data]
  );

  return {
    data: annotations,
    isFetched:
      byInternalId.isFetched && (byExternalId.isFetched || !file.externalId),
    isError: byInternalId.isError || byExternalId.isError,
    isFetching: byInternalId.isFetching || byExternalId.isFetching,
  };
};
