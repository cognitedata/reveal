import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ValueByDataType, ValueByField } from '../containers/Filter';
import { DataModelV2 } from '../services/types';

export enum ParamKeys {
  ExpandedId = 'expandedId',
  SearchQuery = 'searchQuery',
  Filters = 'filters',
  DataModels = 'models',
  AISearch = 'aiSearch',
  ViewMode = 'viewMode',
}

export type ViewMode = '3d' | 'list';

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

        currentParams.set(ParamKeys.ExpandedId, id);

        return currentParams;
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
        currentParams.set(ParamKeys.SearchQuery, query ?? '');
        return currentParams;
      });
    },
    [setSearchParams]
  );

  return [searchParams.get(ParamKeys.SearchQuery) || '', setSearchQueryParams];
};

export const useViewModeParams = (): [
  ViewMode,
  (viewMode?: ViewMode) => void
] => {
  const [searchParams, setSearchParams] = useSearchParams();
  const DefaultViewMode = 'list';

  const viewMode = (searchParams.get(ParamKeys.ViewMode) ??
    DefaultViewMode) as ViewMode;

  const setViewMode = useCallback(
    (mode?: ViewMode) => {
      setSearchParams((currentParams) => {
        if (mode === undefined) {
          currentParams.delete(ParamKeys.ViewMode);
          return currentParams;
        }

        currentParams.set(ParamKeys.ViewMode, mode);

        return currentParams;
      });
    },
    [setSearchParams]
  );

  return [viewMode, setViewMode];
};

export const useSearchFilterParams = (): [
  ValueByDataType | undefined,
  (query?: ValueByDataType) => void
] => {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchFilterParams = useMemo(() => {
    const filters = searchParams.get(ParamKeys.Filters);

    if (filters) {
      return JSON.parse(filters) as ValueByDataType;
    }

    return undefined;
  }, [searchParams]);

  const setSearchFilterParams = useCallback(
    (query?: ValueByDataType) => {
      setSearchParams((currentParams) => {
        currentParams.set(ParamKeys.Filters, JSON.stringify(query));
        return currentParams;
      });
    },
    [setSearchParams]
  );

  return [searchFilterParams, setSearchFilterParams];
};

export const useDataTypeFilterParams = (
  dataType: string
): [ValueByField | undefined] => {
  const [filterParams] = useSearchFilterParams();

  const dataTypeParams = useMemo(() => {
    return filterParams?.[dataType] || {};
  }, [dataType, filterParams]);

  return [dataTypeParams];
};

export const useDataModelsParams = (): [DataModelV2[] | undefined] => {
  const [searchParams] = useSearchParams();

  const dataModelsParams = useMemo(() => {
    const filters = searchParams.get(ParamKeys.DataModels);

    if (filters) {
      return JSON.parse(filters) as DataModelV2[];
    }

    return undefined;
  }, [searchParams]);

  return [dataModelsParams];
};

export const useAISearchParams = (): [boolean, (value: boolean) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();

  const setAISearchParams = useCallback(
    (value: boolean) => {
      setSearchParams((currentParams) => {
        currentParams.set(ParamKeys.AISearch, String(value));
        return currentParams;
      });
    },
    [setSearchParams]
  );

  return [searchParams.get(ParamKeys.AISearch) === 'true', setAISearchParams];
};
