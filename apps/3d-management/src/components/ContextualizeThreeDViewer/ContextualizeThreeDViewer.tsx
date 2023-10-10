import { useEffect, useState } from 'react';

import { ToastContainer, toast } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

import ErrorToast from './components/ErrorToast';
import { ContextualizeThreeDViewerModelType } from './ContextualizeThreeDViewerModelType';
import { ThreeDModelType } from './types';
import { getThreeDModelType } from './utils/getThreeDModelType';

type ContextualizeThreeDViewerProps = {
  modelId: number;
  revisionId: number;
};

export const ContextualizeThreeDViewer = ({
  modelId,
  revisionId,
}: ContextualizeThreeDViewerProps) => {
  const sdk = useSDK();
  const [modelType, setModelType] = useState<ThreeDModelType>(
    ThreeDModelType.NONE
  );
  const [error, setError] = useState<Error>();

  useEffect(() => {
    const loadThreeDModel = async () => {
      const threeDModel = await getThreeDModelType(sdk, modelId, revisionId);
      setModelType(threeDModel);
    };

    loadThreeDModel();
  }, [sdk, modelId, revisionId]);

  useEffect(() => {
    if (error) {
      toast.error(<ErrorToast error={error} />, {
        autoClose: false,
      });
    }
  }, [error]);

  useEffect(() => {
    if (
      modelType !== ThreeDModelType.NONE &&
      modelType !== ThreeDModelType.POINT_CLOUD &&
      modelType !== ThreeDModelType.CAD
    ) {
      setError(
        new Error(
          ' Model type error or not recognized. Please refresh the page or try another model'
        )
      );
    }
  }, [modelType]);

  return (
    <>
      <ToastContainer />
      <ContextualizeThreeDViewerModelType
        modelId={modelId}
        revisionId={revisionId}
        modelType={modelType}
      />
    </>
  );
};
