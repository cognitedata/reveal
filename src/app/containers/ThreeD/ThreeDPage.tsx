import React from 'react';
import { useParams } from 'react-router-dom';
import { SdkResourceType, useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Model3D } from '@cognite/sdk';
import { PageTitle } from '@cognite/cdf-utilities';
import { ThreeDPreview } from './ThreeDPreview';

export const ThreeDPage = () => {
  const { id: threeDIdString = '' } = useParams<{
    id: string;
  }>();
  const threeDId = parseInt(threeDIdString, 10);

  const { data: threeD } = useCdfItem<Model3D>(
    'threeD' as SdkResourceType,
    {
      id: threeDId,
    },
    { enabled: Boolean(threeDIdString) }
  );

  if (!threeDIdString) {
    return null;
  }

  return (
    <>
      <PageTitle title={threeD?.name} />
      <ThreeDPreview threeDId={threeDId} />
    </>
  );
};
