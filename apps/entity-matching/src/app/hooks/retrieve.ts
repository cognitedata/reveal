import { useQuery, UseQueryResult, QueryKey } from '@tanstack/react-query';

import {
  Asset,
  CogniteClient,
  CogniteError,
  CogniteEvent,
  FileInfo,
  IdEither,
  Sequence,
  Timeseries,
} from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { API } from '../types/api';

type Opts = {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  staleTime?: number;
};

const getRetrieveKey = (api: API, ids: IdEither[], opts?: Opts): QueryKey => [
  api,
  'retrieve',
  ids,
  opts,
];

function getItems(sdk: CogniteClient, api: API, ids: IdEither[]) {
  switch (api) {
    case 'assets': {
      return sdk.assets.retrieve(ids);
    }
    case 'timeseries': {
      return sdk.timeseries.retrieve(ids);
    }
    case 'events': {
      return sdk.events.retrieve(ids);
    }
    case 'files': {
      return sdk.files.retrieve(ids);
    }
    case 'sequences': {
      return sdk.sequences.retrieve(ids);
    }
    default: {
      return Promise.reject('API not supported');
    }
  }
}

export function useRetrieve(
  api: 'events',
  ids: IdEither[],
  opts?: Opts
): UseQueryResult<CogniteEvent[], CogniteError>;

export function useRetrieve(
  api: 'assets',
  ids: IdEither[],
  opts?: Opts
): UseQueryResult<Asset[], CogniteError>;

export function useRetrieve(
  api: 'timeseries',
  ids: IdEither[],
  opts?: Opts
): UseQueryResult<Timeseries[], CogniteError>;

export function useRetrieve(
  api: 'files',
  ids: IdEither[],
  opts?: Opts
): UseQueryResult<FileInfo[], CogniteError>;

export function useRetrieve(
  api: 'sequences',
  ids: IdEither[],
  opts?: Opts
): UseQueryResult<Sequence[], CogniteError>;

export function useRetrieve(
  api: API,
  ids: IdEither[],
  opts?: Opts
):
  | UseQueryResult<Timeseries[], CogniteError>
  | UseQueryResult<CogniteEvent[], CogniteError>
  | UseQueryResult<Asset[], CogniteError>
  | UseQueryResult<FileInfo[], CogniteError>
  | UseQueryResult<Sequence[], CogniteError>;

export function useRetrieve(
  api: API,
  ids: IdEither[],
  opts?: Opts
):
  | UseQueryResult<Timeseries[], CogniteError>
  | UseQueryResult<CogniteEvent[], CogniteError>
  | UseQueryResult<Asset[], CogniteError>
  | UseQueryResult<FileInfo[], CogniteError>
  | UseQueryResult<Sequence[], CogniteError> {
  const sdk = useSDK();
  return useQuery(
    getRetrieveKey(api, ids, opts),
    async () => {
      return getItems(sdk, api, ids);
    },
    opts
  );
}
