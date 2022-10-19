import React from 'react';
import {
  useSearch,
  useAggregate,
  SdkResourceType,
} from '@cognite/sdk-react-query-hooks';
import { formatNumber } from 'utils';
import { Label } from '@cognite/cogs.js';
import { getTitle, ResourceType, convertResourceType } from 'types';
import { ThreeDModelsResponse, useInfinite3DModels } from 'hooks';
import { Model3D } from '@cognite/sdk';
import { useDocumentFilteredAggregateCount } from '@cognite/react-document-search';

type ResultProps = {
  api: 'list' | 'search';
  type: ResourceType;
  filter?: any;
  count?: number;
  query?: string;
  label?: string;
  isThreeD?: boolean;
};

export function ResultCount(props: ResultProps) {
  const resultWithFilters = useResultCount(props);
  const result = useResultCount({
    ...props,
    filter: {},
  });

  if (!result.count) return null;

  return (
    <Label variant="normal">
      {resultWithFilters.count} of {result.count} {result.label}
    </Label>
  );
}

export const useResultCount = ({
  api,
  type,
  filter,
  query,
  count,
  label,
}: ResultProps) => {
  const sdkType = convertResourceType(type);

  const { data: search, isFetched: searchDone } = useSearch(
    sdkType,
    query!,
    { limit: 1000, filter },
    {
      enabled:
        type !== 'threeD' && api === 'search' && query
          ? query.length > 0
          : false,
    }
  );
  const {
    data: modelData = { pages: [] as ThreeDModelsResponse[] },
    isLoading: is3DModelLoading,
  } = useInfinite3DModels(undefined, {
    enabled: type === 'threeD',
  });
  const { data: list, isFetched: listDone } = useAggregate(
    sdkType as SdkResourceType,
    filter,
    {
      enabled: type !== 'threeD' && api === 'list' && !count,
    }
  );
  const result = {
    count: 0,
    label: label || getTitle(type, count !== 1).toLowerCase(),
  };

  const { data: filteredDocumentCount } = useDocumentFilteredAggregateCount();
  if (type === 'document') {
    return { ...result, count: formatNumber(filteredDocumentCount || 0) };
  }

  if (type === 'threeD') {
    if (is3DModelLoading) return result;
    const models = modelData.pages.reduce(
      (accl, t) => accl.concat(t.items),
      [] as Model3D[]
    );

    const filteredModels = models.filter(model =>
      model.name.toLowerCase().includes(query?.toLowerCase() || '')
    );
    return { ...result, count: formatNumber(filteredModels.length) };
  }

  if (count !== undefined) return { ...result, count: formatNumber(count) };

  switch (api) {
    case 'list': {
      if (listDone && Number.isFinite(list?.count)) {
        return { ...result, count: formatNumber(list?.count!) };
      }
      return result;
    }
    case 'search': {
      if (searchDone && Number.isFinite(search?.length))
        return { ...result, count: formatNumber(search?.length!) };
      return result;
    }
  }
  return result;
};
