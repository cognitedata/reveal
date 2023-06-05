import { useCallback, useMemo } from 'react';
import { createSearchParams, useSearchParams } from 'react-router-dom';

import { ValueByDataType } from '../containers/search/Filter';
import { decodeSearchParams, encodeSearchParams } from '../utils/searchParams';

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

  return [searchParams.get('searchQuery') || '', setSearchParams];
};

export const useSearchFilterParams = (): [
  ValueByDataType,
  (query?: ValueByDataType) => void
] => {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchFilterParams = useMemo(() => {
    return decodeSearchParams(searchParams).filters;
  }, [searchParams]);

  const setSearchFilterParams = useCallback(
    (query?: ValueByDataType) => {
      setSearchParams((prevState) =>
        encodeSearchParams({
          ...prevState,
          filters: JSON.stringify(query),
        })
      );
    },
    [setSearchParams]
  );

  return [searchFilterParams, setSearchFilterParams];
};
