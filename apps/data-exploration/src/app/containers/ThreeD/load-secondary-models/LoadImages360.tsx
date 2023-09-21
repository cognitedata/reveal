import { useEffect } from 'react';

import {
  useQueries,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import * as THREE from 'three';

import { Cognite3DViewer, Image360, Image360Collection } from '@cognite/reveal';

import { Image360DatasetOptions } from '../contexts/ThreeDContext';
import {
  getImages360AppliedStateQueryKey,
  getImages360QueryFn,
  IMAGES_360_BASE_QUERY_KEY,
} from '../hooks';
import { useRevealError } from '../hooks/useRevealError';

type LoadImages360Props = {
  images360: Image360DatasetOptions[];
  setImage360Entity: (entity: Image360 | undefined) => void;
  setEntered360ImageCollection: (
    collection: Image360Collection | undefined
  ) => void;
  viewer: Cognite3DViewer;
};

const LoadImages360 = ({
  images360,
  setImage360Entity,
  setEntered360ImageCollection,
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
          setImage360Entity,
          setEntered360ImageCollection,
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
