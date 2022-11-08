import React from 'react';
import { Loader } from '@cognite/data-exploration';
import { useParams } from 'react-router-dom';
import { useDefault3DModelRevision } from './hooks';
import { ThreeDContextProvider } from './ThreeDContext';
import { ThreeDView } from './ThreeDView';

export const ThreeDPage = () => {
  const { id: threeDIdString = '' } = useParams<{
    id: string;
  }>();
  const threeDId = parseInt(threeDIdString, 10);

  const { data: revision, isFetching } = useDefault3DModelRevision(threeDId);

  if (!threeDIdString || !Number.isFinite(threeDId)) {
    return null;
  }

  if (isFetching) {
    return <Loader />;
  }

  if (!revision) {
    return null;
  }

  return (
    <ThreeDContextProvider>
      <ThreeDView key={threeDId} modelId={threeDId} revisionId={revision.id} />
    </ThreeDContextProvider>
  );
};
