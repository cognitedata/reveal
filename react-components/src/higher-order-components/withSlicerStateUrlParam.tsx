/*!
 * Copyright 2023 Cognite AS
 */

import { useEffect, type FunctionComponent, type ReactElement } from 'react';
import { sliceChangedEvent } from '../components/RevealToolbar/Slicer/SlicerEvent';
import { useReveal } from '../components/RevealContainer/RevealContext';
import { Box3 } from 'three';
import { useUrlStateParam } from '../hooks/useUrlStateParam';

type SlicerState = Required<{ top: number; bottom: number }>;

export function withSlicerStateUrlParam<T extends object>(
  Component: FunctionComponent<T>
): FunctionComponent<T> {
  return function SlicerStateUrlParam(props: T): ReactElement {
    const reveal = useReveal();

    const setUrlParamOnSlicerChanged = (): void => {
      const urlParam = useUrlStateParam();
      const { top, bottom } = urlParam.getSlicerStateFromUrlParam();
      const currentSlicerState = getCurrentSlicerState();

      if (
        currentSlicerState === undefined ||
        !hasSlicerStateChanged({ top, bottom }, currentSlicerState)
      ) {
        return;
      }
      urlParam.setUrlParamOnSlicerChanged(currentSlicerState.top, currentSlicerState.bottom);
    };

    useEffect(() => {
      sliceChangedEvent.subscribe(setUrlParamOnSlicerChanged);
      return () => {
        sliceChangedEvent.unsubscribe(setUrlParamOnSlicerChanged);
      };
    }, []);

    function getCurrentSlicerState(): SlicerState | undefined {
      const clippingPlanes = reveal.getGlobalClippingPlanes();

      if (clippingPlanes.length !== 2) {
        return;
      }

      const firstPlane = clippingPlanes[0];
      const secondPlane = clippingPlanes[1];

      if (Number.isNaN(firstPlane.constant) || Number.isNaN(secondPlane.constant)) {
        return { top: 1, bottom: 0 };
      }

      const box = new Box3();
      reveal.models.forEach((model) => box.union(model.getModelBoundingBox()));

      const maxHeight = box.max.y;
      const minHeight = box.min.y;

      // Calculate new top & bottom values based on the clipping planes
      const bottomRatio = -(firstPlane.constant + minHeight) / (maxHeight - minHeight);
      const topRatio = (secondPlane.constant - minHeight) / (maxHeight - minHeight);

      return { top: topRatio, bottom: bottomRatio };
    }

    function hasSlicerStateChanged(previous: SlicerState, current: SlicerState): boolean {
      const epsilon = 0.001;
      const { top: previousTop, bottom: previousBottom } = previous;
      const { top: currentTop, bottom: currentBottom } = current;
      return (
        Math.abs(previousTop - currentTop) > epsilon ||
        Math.abs(previousBottom - currentBottom) > epsilon
      );
    }

    return <Component {...props} />;
  };
}
