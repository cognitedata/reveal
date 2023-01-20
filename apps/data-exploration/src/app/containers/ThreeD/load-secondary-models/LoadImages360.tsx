import { useEffect } from 'react';

import { Cognite3DViewer, Image360 } from '@cognite/reveal';
import { useQueries, useQueryClient, UseQueryOptions } from 'react-query';

import {
  getImages360AppliedStateQueryKey,
  getImages360QueryFn,
  IMAGES_360_BASE_QUERY_KEY,
} from '@data-exploration-app/containers/ThreeD/hooks';
import { CubemapDatasetOptions } from '@data-exploration-app/containers/ThreeD/ThreeDContext';
import * as THREE from 'three';

type LoadImages360Props = {
  images360: CubemapDatasetOptions[];
  imageEntities: { siteId: string; images: Image360[] }[];
  setImageEntities: (
    entities: { siteId: string; images: Image360[] }[]
  ) => void;
  viewer: Cognite3DViewer;
};

const LoadImages360 = ({
  images360,
  imageEntities,
  setImageEntities,
  viewer,
}: LoadImages360Props): JSX.Element => {
  const queryClient = useQueryClient();
  useQueries<
    UseQueryOptions<
      boolean | undefined,
      undefined,
      boolean | undefined,
      (
        | string
        | number
        | boolean
        | THREE.Matrix4
        | { siteId: string; images: Image360[] }[]
        | ((entities: { siteId: string; images: Image360[] }[]) => void)
        | undefined
      )[]
    >[]
  >(
    images360.map(({ applied, siteId, rotationMatrix, translationMatrix }) => ({
      queryKey: getImages360AppliedStateQueryKey(
        siteId,
        applied,
        rotationMatrix,
        translationMatrix
      ),
      queryFn: getImages360QueryFn(
        queryClient,
        viewer,
        siteId,
        applied,
        imageEntities,
        setImageEntities,
        rotationMatrix,
        translationMatrix
      ),
    }))
  );

  useEffect(() => {
    return () => {
      queryClient.invalidateQueries(IMAGES_360_BASE_QUERY_KEY);
    };
  }, [queryClient]);

  return <></>;
};

export default LoadImages360;
