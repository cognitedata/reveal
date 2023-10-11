import {
  Dispatch,
  SetStateAction,
  useDebugValue,
  useState as reactUseState,
} from 'react';

import { createLink } from '@cognite/cdf-utilities';
import { Metadata } from '@cognite/sdk';

import { PredictionObject } from '../hooks/entity-matching-predictions';
// @ts-ignore
import { styleScope } from '../styles/styleScope';
import { API } from '../types/api';

export const getContainer = () => {
  const els = document.getElementsByClassName(styleScope);
  const el = els.item(0)! as HTMLElement;
  return el;
};

export const createInternalLink = (path?: string | number) => {
  const mountPoint = window.location.pathname.split('/')[2];
  return createLink(`/${mountPoint}/${path || ''}`);
};

export const sleep = async (ms: number) =>
  new Promise<void>((resolve) => setTimeout(() => resolve(), ms));

export const formatPredictionObject = (o: PredictionObject): string => {
  return o.name || o.description || o.externalId || o.id.toString();
};

function useDebugState<S>(
  initialState: S | (() => S),
  label: string = 'unknown'
): [S, Dispatch<SetStateAction<S>>] {
  const [v, setV] = reactUseState<S>(initialState);
  useDebugValue(`${label}: ${JSON.stringify(v)}`);
  return [v, setV];
}

function useVanillaState<S>(
  initialState: S | (() => S),
  _: string = ''
): [S, Dispatch<SetStateAction<S>>] {
  return reactUseState<S>(initialState);
}

export const useContextState =
  process.env.NODE_ENV === 'production' ? useVanillaState : useDebugState;

/**
 * Transform all metadata keys to lowercase. This is convenient since metadata filters/aggregate are
 * case insensitive/down cased and this will make picking values out of metadata objects based on
 * aggregates a non-issue.
 */
export const downcaseMetadata = (md?: Metadata) => {
  return md
    ? Object.entries(md).reduce(
        (accl, [k, v]) => ({ ...accl, [k.toLowerCase()]: v }),
        {} as Metadata
      )
    : undefined;
};

export const bulkDownloadStatus = ({
  hasNextPage,
  isFetching,
  isError,
}: {
  isFetching?: boolean;
  isError?: boolean;
  hasNextPage?: boolean;
}): 'loading' | 'error' | 'success' | 'idle' | undefined => {
  if (isError) {
    return isFetching ? 'loading' : 'error';
  } else if (hasNextPage) {
    return isFetching ? 'loading' : 'idle';
  } else {
    return isFetching ? 'loading' : 'success';
  }
};

const searchFields: Record<string, string[] | undefined> = {
  defaultFields: ['name', 'description'],
  events: ['description'],
  files: undefined,
};

export const getAdvancedFilter = ({
  api: sourceType,
  excludeMatched,
  query,
}: {
  api: API;
  excludeMatched?: boolean;
  query?: string | null;
}) => {
  const nonMatched = (() => {
    switch (sourceType) {
      case 'assets': {
        return {
          not: {
            exists: {
              property: ['parentId'],
            },
          },
        };
      }
      case 'events': {
        return {
          not: {
            exists: {
              property: ['assetIds'],
            },
          },
        };
      }
      default: {
        return {
          not: {
            exists: {
              property: ['assetId'],
            },
          },
        };
      }
    }
  })();

  const fields = Object.keys(searchFields).includes(sourceType)
    ? searchFields[sourceType]
    : searchFields.defaultFields;
  const searchNodes = fields?.map((f) => ({
    search: {
      property: [f],
      value: query,
    },
  }));
  const searchFilter = searchNodes && {
    or: searchNodes,
  };

  const filters = [
    excludeMatched ? nonMatched : undefined,
    query ? searchFilter : undefined,
  ].filter(Boolean);

  return filters.length > 0
    ? {
        and: filters,
      }
    : undefined;
};

export const filterFieldsFromObjects = (
  arr: Record<string, any>[],
  keys: string[]
): Record<string, any>[] => {
  return arr.map((item) => {
    const filteredItem: Record<string, any> = {};
    keys.forEach((key: string) => {
      if (key.startsWith('metadata')) {
        const metadataKey = key.slice(9);
        filteredItem[key] = item.metadata[metadataKey];
      } else {
        filteredItem[key] = item[key];
      }
    });
    return filteredItem;
  });
};

export const sessionStoragePredictJobKey = (jobId: number) =>
  `predict-job-token-${jobId}`;
export const sessionStorageRulesJobKey = (jobId: number) =>
  `rules-job-token-${jobId}`;
export const sessionStorageApplyRulesJobKey = (jobId: number) =>
  `apply-rules-job-token-${jobId}`;
export const sessionStorage3dDetailsKey = (jobId: number) =>
  `3d-details-${jobId}`;
