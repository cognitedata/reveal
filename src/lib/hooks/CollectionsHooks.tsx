import sdk from 'sdk-singleton';
import { useMutation, useQuery, useQueryCache } from 'react-query';
import { ResourceType } from 'lib/types';
import { getProject, getEnv } from '../utils/URLUtils';

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
  const cached = useQueryCache();
  return useMutation<Collection[], unknown, CollectionSpec[]>(
    (items: CollectionSpec[]) => createCollections(items),
    {
      onSuccess: data => {
        cached.setQueryData(
          `/collections`,
          (cached.getQueryData<Collection[]>(`/collections`) || []).concat(data)
        );
      },
    }
  );
};

export const useDeleteCollections = () => {
  const cached = useQueryCache();
  return useMutation<Collection[], unknown, string[]>(
    (ids: string[]) => deleteCollections(ids),
    {
      onSuccess: (_, ids) => {
        cached.setQueryData(
          `/collections`,
          (cached.getQueryData<Collection[]>(`/collections`) || []).filter(
            el => !ids.includes(el.id)
          )
        );
      },
    }
  );
};
export const useUpdateCollections = () => {
  const cached = useQueryCache();
  return useMutation<Collection[], unknown, CollectionUpdateSpec[]>(
    (items: CollectionUpdateSpec[]) => updateCollections(items),
    {
      onSuccess: items => {
        items.forEach(collection => {
          cached.setQueryData(`/collections/${collection.id}`, collection);
        });
        cached.setQueryData(
          `/collections`,
          (cached.getQueryData<Collection[]>(`/collections`) || []).map(el => {
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
  const cached = useQueryCache();
  return useQuery<Collection[]>('/collections', listCollections, {
    onSuccess: data => {
      data.forEach(collection => {
        cached.setQueryData(`/collections/${collection.id}`, collection);
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
