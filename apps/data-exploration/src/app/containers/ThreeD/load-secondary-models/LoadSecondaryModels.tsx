import React, { useEffect, Dispatch, SetStateAction } from 'react';

import {
  Cognite3DViewer,
  CogniteCadModel,
  CognitePointCloudModel,
} from '@cognite/reveal';
import { useQueries, useQueryClient, UseQueryOptions } from 'react-query';

import {
  SECONDARY_MODEL_BASE_QUERY_KEY,
  getSecondaryModelAppliedStateQueryKey,
  getSecondaryModelQueryFn,
} from '@data-exploration-app/containers/ThreeD/hooks';
import { SecondaryModelOptions } from '@data-exploration-app/containers/ThreeD/ThreeDContext';

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
        loadedSecondaryModels,
        setLoadedSecondaryModels,
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
