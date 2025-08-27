import { useEffect } from 'react';
import { type AddResourceOptions } from '..';
import {
  useReveal3DResourcesCount,
  useReveal3DResourcesSetExpectedToLoadCount
} from '../Reveal3DResourcesInfoContext';

export function useSetExpectedLoadCount(resources: AddResourceOptions[]): void {
  const setExpectedToLoadCount = useReveal3DResourcesSetExpectedToLoadCount();
  const { setRevealResourcesCount } = useReveal3DResourcesCount();

  useEffect(() => {
    setExpectedToLoadCount(resources.length);
  }, [resources, setRevealResourcesCount]);
}
