import qs from 'query-string';
import { useParams, useHistory } from 'react-router-dom';
import { ResourceType } from '@cognite/data-exploration';
import { createLink } from '@cognite/cdf-utilities';

import { v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { getProject, getEnv } from './utils/URLUtils';
import { SEARCH_KEY } from './utils/constants';

const opts: { arrayFormat: 'comma' } = { arrayFormat: 'comma' };

const getSetItems = (
  key: string,
  push: boolean,
  history: ReturnType<typeof useHistory>
) => (newItems: string | string[] | undefined) => {
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
};

export function useQueryString(
  key: string,
  push = true
): [string, (_: string) => void] {
  const history = useHistory();

  const search = qs.parse(history?.location?.search, opts);
  const item = (search[key] || '') as string;

  return [decodeURIComponent(item), getSetItems(key, push, history)];
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

export type CollectionOperationType = 'retrieve' | 'list';

export type Collection = {
  id: string;
  name?: string;
  description?: string;
  type: ResourceType;
  operationType: CollectionOperationType;
  operationBody: any;
  createdTime: Date;
  lastUpdatedTime: Date;
};

export type CollectionSpec = {
  name?: string;
  description?: string;
  type: ResourceType;
  operationType: CollectionOperationType;
  operationBody: any;
};

export type CollectionUpdateSpec = {
  id: string;
  update: {
    name?: string;
    description?: string;
    type?: ResourceType;
    operationType?: CollectionOperationType;
    operationBody?: any;
  };
};

const USE_LOCALHOST = false; // Change if running the cdf-hub-api locally

const getBaseUrl = () => {
  const project = getProject();
  const env = getEnv();
  let apiHost;
  if (USE_LOCALHOST) {
    apiHost = 'http://localhost:8001';
  } else {
    apiHost = `https://cdf-hub-api.${env || 'europe-west1-1'}.cognite.ai`;
  }
  const baseUrl = `${apiHost}/v1/projects/${project}/collections`;
  return baseUrl;
};

const listCollections = async () => {
  const { items } = (
    await sdk.post<{ items: Collection[] }>(`${getBaseUrl()}/list`, {
      withCredentials: true,
    })
  ).data;
  return items;
};

const retrieveCollections = async (ids: string[]) => {
  const { items } = (
    await sdk.post<{ items: Collection[] }>(`${getBaseUrl()}/byids`, {
      data: {
        items: ids.map(id => ({ id })),
      },
      withCredentials: true,
    })
  ).data;
  return items;
};

const deleteCollections = async (ids: string[]) => {
  const { items } = (
    await sdk.post<{ items: Collection[] }>(`${getBaseUrl()}/delete`, {
      data: {
        items: ids.map(id => ({ id })),
      },
      withCredentials: true,
    })
  ).data;
  return items;
};

const createCollections = async (items: CollectionSpec[]) => {
  const { items: collections } = (
    await sdk.post<{ items: Collection[] }>(`${getBaseUrl()}`, {
      data: {
        items,
      },
      withCredentials: true,
    })
  ).data;
  return collections;
};

const updateCollections = async (items: CollectionUpdateSpec[]) => {
  const { items: collections } = (
    await sdk.post<{ items: Collection[] }>(`${getBaseUrl()}/update`, {
      data: {
        items,
      },
      withCredentials: true,
    })
  ).data;
  return collections;
};

export const useCreateCollections = () => {
  const client = useQueryClient();
  return useMutation<Collection[], unknown, CollectionSpec[]>(
    (items: CollectionSpec[]) => createCollections(items),
    {
      onSuccess: data => {
        client.setQueryData(
          `/collections`,
          (client.getQueryData<Collection[]>(`/collections`) || []).concat(data)
        );
      },
    }
  );
};

export const useDeleteCollections = () => {
  const client = useQueryClient();
  return useMutation<Collection[], unknown, string[]>(
    (ids: string[]) => deleteCollections(ids),
    {
      onSuccess: (_, ids) => {
        client.setQueryData(
          `/collections`,
          (client.getQueryData<Collection[]>(`/collections`) || []).filter(
            el => !ids.includes(el.id)
          )
        );
      },
    }
  );
};
export const useUpdateCollections = () => {
  const client = useQueryClient();
  return useMutation<Collection[], unknown, CollectionUpdateSpec[]>(
    (items: CollectionUpdateSpec[]) => updateCollections(items),
    {
      onSuccess: items => {
        items.forEach(collection => {
          client.setQueryData(`/collections/${collection.id}`, collection);
        });
        client.setQueryData(
          `/collections`,
          (client.getQueryData<Collection[]>(`/collections`) || []).map(el => {
            const item = items.find(it => it.id === el.id);
            if (item) {
              return item;
            }
            return el;
          })
        );
      },
    }
  );
};

export const useCollections = () => {
  const client = useQueryClient();
  return useQuery<Collection[]>('/collections', listCollections, {
    onSuccess: data => {
      data.forEach(collection => {
        client.setQueryData(`/collections/${collection.id}`, collection);
      });
    },
  });
};

export const useCollection = (collectionId: string) => {
  return useQuery<Collection>(
    `/collections/${collectionId}`,
    async () => (await retrieveCollections([collectionId]))[0]
  );
};
