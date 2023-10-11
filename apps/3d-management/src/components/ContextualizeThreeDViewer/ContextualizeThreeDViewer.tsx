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
  useEffect(() => {
    const loadThreeDModel = async () => {
      const threeDModelType = await getThreeDModelType(
        sdk,
        modelId,
        revisionId
      );
      if (threeDModelType === ThreeDModelType.UNKNOWN) {
        toast.error(
          <ErrorToast
            error={
              new Error(
                'Model type error or not recognized. Please refresh the page or try another model'
              )
            }
          />,
          {
            autoClose: false,
          }
        );
      }
      setModelType(threeDModelType);
    };

    loadThreeDModel();
  }, [sdk, modelId, revisionId]);

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
