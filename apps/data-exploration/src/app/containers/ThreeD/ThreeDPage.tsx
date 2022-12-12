import React from 'react';
import { useParams } from 'react-router-dom';
import { ThreeDContextProvider } from './ThreeDContext';
import { ThreeDView } from './ThreeDView';
import { useSearchParamString } from 'app/utils/URLUtils';

export const ThreeDPage = () => {
  const { id: threeDIdString = '' } = useParams<{
    id: string;
  }>();
  const threeDId = parseInt(threeDIdString, 10);
  const [revisionId] = useSearchParamString('revisionId');

  if (!threeDIdString || !Number.isFinite(threeDId)) {
    return null;
  }

  return (
    <ThreeDContextProvider key={`${threeDId}.${revisionId}`} modelId={threeDId}>
      <ThreeDView key={threeDId} modelId={threeDId} />
    </ThreeDContextProvider>
  );
};
