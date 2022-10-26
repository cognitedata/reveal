import React from 'react';
import { useParams } from 'react-router-dom';
import { ThreeDView } from './ThreeDView';

export const ThreeDPage = () => {
  const { id: threeDIdString = '' } = useParams<{
    id: string;
  }>();
  const threeDId = parseInt(threeDIdString, 10);

  if (!threeDIdString || !Number.isFinite(threeDId)) {
    return null;
  }

  return <ThreeDView modelId={threeDId} />;
};
