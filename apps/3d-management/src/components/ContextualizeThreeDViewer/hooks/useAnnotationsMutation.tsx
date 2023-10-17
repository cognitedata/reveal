import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CogniteClient } from '@cognite/sdk/';
import { useSDK } from '@cognite/sdk-provider';

import { useContextualizeThreeDViewerStore } from '../useContextualizeThreeDViewerStore';

export const useAnnotationMutation = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  const { modelId } = useContextualizeThreeDViewerStore((state) => ({
    modelId: state.modelId,
  }));

  return useMutation(
    (annotationId: number) => deleteCdfAnnotation(sdk, annotationId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['annotations', sdk, modelId]);
      },
    }
  );
};

const deleteCdfAnnotation = async (
  sdk: CogniteClient,
  annotationId: number
) => {
  return await sdk.annotations.delete([{ id: annotationId }]);
};
