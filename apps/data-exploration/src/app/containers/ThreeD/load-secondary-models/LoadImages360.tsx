import { useEffect } from 'react';

import { Cognite3DViewer, Image360Collection } from '@cognite/reveal';
import { useQueries, useQueryClient, UseQueryOptions } from 'react-query';

import {
  getImages360AppliedStateQueryKey,
  getImages360QueryFn,
  IMAGES_360_BASE_QUERY_KEY,
} from '@data-exploration-app/containers/ThreeD/hooks';
import { Image360DatasetOptions } from '@data-exploration-app/containers/ThreeD/ThreeDContext';
import * as THREE from 'three';

type LoadImages360Props = {
  images360: Image360DatasetOptions[];
  imageEntities: { siteId: string; images: Image360Collection }[];
  setImageEntities: (
    entities: { siteId: string; images: Image360Collection }[]
  ) => void;
  is360ImagesMode: boolean;
  setIs360ImagesMode: (mode: boolean) => void;
  viewer: Cognite3DViewer;
};

const LoadImages360 = ({
  images360,
  imageEntities,
  setImageEntities,
  is360ImagesMode,
  setIs360ImagesMode,
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
        | { siteId: string; images: Image360Collection }[]
        | ((entities: { siteId: string; images: Image360Collection }[]) => void)
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
        is360ImagesMode,
        setIs360ImagesMode,
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
