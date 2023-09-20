/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useCallback } from 'react';
import { Box3, Plane, Vector3 } from 'three';
import { Reveal3DResources, type Reveal3DResourcesProps, useReveal } from '../../src';
import { useUrlStateParam } from '../../src/hooks/useUrlStateParam';

type RevealResources = typeof Reveal3DResources;

function with3dResourcesSliceOnLoad(Component: RevealResources): RevealResources {
  return function SuppressRevealEvents(props: Reveal3DResourcesProps): ReactElement {
    const reveal = useReveal();
    const onResourcesAdded = useCallback(() => {
      const urlParam = useUrlStateParam();
      const { top, bottom } = urlParam.getSlicerStateFromUrlParam();

      const box = new Box3();
      reveal.models.forEach((model) => box.union(model.getModelBoundingBox()));

      const maxHeight = box.max.y;
      const minHeight = box.min.y;

      reveal.setGlobalClippingPlanes([
        new Plane(new Vector3(0, 1, 0), -(minHeight + bottom * (maxHeight - minHeight))),
        new Plane(new Vector3(0, -1, 0), minHeight + top * (maxHeight - minHeight))
      ]);
      props.onResourcesAdded?.();
    }, []);

    return <Component {...props} onResourcesAdded={onResourcesAdded} />;
  };
}

export const RevealResourcesSlicerOnLoad = with3dResourcesSliceOnLoad(Reveal3DResources);
