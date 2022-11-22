import React, { useEffect } from 'react';

import { Cognite3DViewer } from '@cognite/reveal';
import { useQueries, useQueryClient, UseQueryOptions } from 'react-query';

import {
  SECONDARY_MODEL_BASE_QUERY_KEY,
  getSecondaryModelAppliedStateQueryKey,
  getSecondaryModelQueryFn,
} from 'app/containers/ThreeD/hooks';
import { SecondaryModelOptions } from 'app/containers/ThreeD/ThreeDContext';

type LoadSecondaryModelsProps = {
  secondaryModels: SecondaryModelOptions[];
  viewer: Cognite3DViewer;
};

const LoadSecondaryModels = ({
  secondaryModels,
  viewer,
}: LoadSecondaryModelsProps): JSX.Element => {
  const queryClient = useQueryClient();
  useQueries<
    UseQueryOptions<
      boolean | undefined,
      undefined,
      boolean | undefined,
      (string | number | boolean | undefined)[]
    >[]
  >(
    secondaryModels.map(({ applied, modelId, revisionId }) => ({
      queryKey: getSecondaryModelAppliedStateQueryKey(
        modelId,
        revisionId,
        applied
      ),
      queryFn: getSecondaryModelQueryFn(
        queryClient,
        viewer,
        modelId,
        revisionId,
        applied
      ),
    }))
  );

  useEffect(() => {
    return () => {
      queryClient.invalidateQueries(SECONDARY_MODEL_BASE_QUERY_KEY);
    };
  }, [queryClient]);

  return <></>;
};

export default LoadSecondaryModels;
