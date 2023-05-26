import React, { useEffect, Dispatch, SetStateAction } from 'react';

import {
  SECONDARY_MODEL_BASE_QUERY_KEY,
  getSecondaryModelAppliedStateQueryKey,
  getSecondaryModelQueryFn,
} from '@data-exploration-app/containers/ThreeD/hooks';
import { useRevealError } from '@data-exploration-app/containers/ThreeD/hooks/useRevealError';
import { SecondaryModelOptions } from '@data-exploration-app/containers/ThreeD/ThreeDContext';
import {
  useQueries,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

import {
  Cognite3DViewer,
  CogniteCadModel,
  CognitePointCloudModel,
} from '@cognite/reveal';

type LoadSecondaryModelsProps = {
  secondaryModels: SecondaryModelOptions[];
  viewer: Cognite3DViewer;
  loadedSecondaryModels: (CogniteCadModel | CognitePointCloudModel)[];
  setLoadedSecondaryModels: Dispatch<
    SetStateAction<(CogniteCadModel | CognitePointCloudModel)[]>
  >;
};

const LoadSecondaryModels = ({
  secondaryModels,
  viewer,
  loadedSecondaryModels,
  setLoadedSecondaryModels,
}: LoadSecondaryModelsProps): JSX.Element => {
  const queryClient = useQueryClient();
  const result = useQueries<
    UseQueryOptions<
      boolean | undefined,
      { message: string },
      boolean | undefined,
      (string | number | boolean | undefined)[]
    >[]
  >({
    queries: secondaryModels.map(({ applied, modelId, revisionId }) => ({
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
        loadedSecondaryModels,
        setLoadedSecondaryModels,
        applied
      ),
    })),
  });

  useRevealError(result);

  useEffect(() => {
    return () => {
      queryClient.invalidateQueries([SECONDARY_MODEL_BASE_QUERY_KEY]);
    };
  }, [queryClient]);

  return <></>;
};

export default LoadSecondaryModels;
