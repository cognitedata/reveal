import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ValueByDataType } from '../containers/search/Filter';

export enum ParamKeys {
  ExpandedId = 'expandedId',
}

export const useExpandedIdParams = (): [
  string | undefined,
  (id?: string) => void
] => {
  const [searchParams, setSearchParams] = useSearchParams();
  const expandedId = searchParams.get(ParamKeys.ExpandedId) ?? undefined;

  const setExpandedId = useCallback(
    (id?: string) => {
      setSearchParams((currentParams) => {
        if (id === undefined) {
          currentParams.delete(ParamKeys.ExpandedId);
          return currentParams;
        }

        return {
          ...currentParams,
          [ParamKeys.ExpandedId]: id,
        };
      });
    },
    [setSearchParams]
  );

  return [expandedId, setExpandedId];
};

export const useSearchQueryParams = (): [string, (query?: string) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();

  const setSearchQueryParams = useCallback(
    (query?: string) => {
      setSearchParams((currentParams) => {
        currentParams.set('searchQuery', query ?? '');
        return currentParams;
      });
    },
    [setSearchParams]
  );

  return [searchParams.get('searchQuery') || '', setSearchQueryParams];
};

export const useSearchFilterParams = (): [
  ValueByDataType | undefined,
  (query?: ValueByDataType) => void
] => {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchFilterParams = useMemo(() => {
    const filters = searchParams.get('filters');

    if (filters) {
      return JSON.parse(filters) as ValueByDataType;
    }

    return undefined;
  }, [searchParams]);

  const setSearchFilterParams = useCallback(
    (query?: ValueByDataType) => {
      setSearchParams((currentParams) => {
        currentParams.set('filters', JSON.stringify(query));
        return currentParams;
      });
    },
    [setSearchParams]
  );

  return [searchFilterParams, setSearchFilterParams];
};
