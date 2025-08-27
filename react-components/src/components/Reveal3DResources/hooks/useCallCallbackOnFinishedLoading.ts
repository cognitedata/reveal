import { useEffect } from 'react';
import { type AddResourceOptions } from '../types';
import {
  useReveal3DResourceLoadFailCount,
  useReveal3DResourcesCount,
  useReveal3DResourcesExpectedInViewerCount
} from '../Reveal3DResourcesInfoContext';

export function useCallCallbackOnFinishedLoading(
  resources: AddResourceOptions[],
  onResourcesAdded: (() => void) | undefined
): void {
  const loadedCount = useReveal3DResourcesCount().reveal3DResourcesCount;
  const expectedLoadCount = useReveal3DResourcesExpectedInViewerCount();
  const { reveal3DResourceLoadFailCount } = useReveal3DResourceLoadFailCount();

  useEffect(() => {
    if (loadedCount === resources.length - reveal3DResourceLoadFailCount) {
      onResourcesAdded?.();
    }
  }, [loadedCount, expectedLoadCount]);
}
