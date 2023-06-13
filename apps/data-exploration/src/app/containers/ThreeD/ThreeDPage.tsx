import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { Cognite3DViewer } from '@cognite/reveal';
import { useSDK } from '@cognite/sdk-provider';

import { useSearchParamString } from '@data-exploration-lib/core';

import { ThreeDContextProvider } from './contexts/ThreeDContext';
import { ThreeDView } from './ThreeDView';

export const ThreeDPage = () => {
  const { id: threeDIdString = '' } = useParams<{
    id: string;
  }>();
  const is360Image = threeDIdString.endsWith('img360');
  const modelId = is360Image ? undefined : parseInt(threeDIdString, 10);
  const image360SiteId = is360Image
    ? threeDIdString.slice(0, threeDIdString.length - 6)
    : undefined;
  const [revisionId] = useSearchParamString('revisionId');

  const sdk = useSDK();

  const viewer = useMemo(
    () =>
      new Cognite3DViewer({
        sdk,
        continuousModelStreaming: true,
        loadingIndicatorStyle: {
          placement: 'topRight',
          opacity: 1,
        },
      }),
    [sdk]
  );

  useEffect(() => {
    return () => {
      viewer?.dispose();
    };
  }, [viewer]);

  if ((!threeDIdString || !Number.isFinite(modelId)) && !image360SiteId) {
    return null;
  }

  return (
    <ThreeDContextProvider
      key={is360Image ? image360SiteId : `${modelId}.${revisionId}`}
      modelId={modelId}
      viewer={viewer}
      image360SiteId={image360SiteId}
    >
      <ThreeDView
        key={modelId ?? image360SiteId}
        modelId={modelId}
        image360SiteId={image360SiteId}
      />
    </ThreeDContextProvider>
  );
};
