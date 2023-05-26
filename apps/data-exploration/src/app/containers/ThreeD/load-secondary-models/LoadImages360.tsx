import { useEffect } from 'react';

import {
  getImages360AppliedStateQueryKey,
  getImages360QueryFn,
  IMAGES_360_BASE_QUERY_KEY,
} from '@data-exploration-app/containers/ThreeD/hooks';
import { useRevealError } from '@data-exploration-app/containers/ThreeD/hooks/useRevealError';
import { Image360DatasetOptions } from '@data-exploration-app/containers/ThreeD/ThreeDContext';
import {
  useQueries,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import * as THREE from 'three';

import { Cognite3DViewer, Image360Collection } from '@cognite/reveal';

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
  const result = useQueries<
    UseQueryOptions<
      boolean | undefined,
      { message: string },
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
  >({
    queries: images360.map(
      ({ applied, siteId, rotationMatrix, translationMatrix }) => ({
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
      })
    ),
  });

  useRevealError(result);

  useEffect(() => {
    return () => {
      queryClient.invalidateQueries([IMAGES_360_BASE_QUERY_KEY]);
    };
  }, [queryClient]);

  return <></>;
};

export default LoadImages360;
