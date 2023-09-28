import { useState, useEffect } from 'react';

import { useSDK } from '@cognite/sdk-provider';

export const useThreeDModelName = (modelId: number): string | undefined => {
  const sdk = useSDK();
  const [modelName, setModelName] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const model = await sdk.models3D.retrieve(modelId);
        setModelName(model.name);
      } catch (error) {
        console.error(`Error fetching model with ID ${modelId}: `, error);
      }
    };
    fetchData();
  }, [sdk, modelId]);

  return modelName;
};
