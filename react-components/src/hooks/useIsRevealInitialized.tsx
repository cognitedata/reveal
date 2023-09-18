/*!
 * Copyright 2023 Cognite AS
 */
import { useRevealKeepAlive } from '../components/RevealKeepAlive/RevealKeepAliveContext';

export const useIsRevealInitialized = (): boolean => {
  const revealKeepAliveData = useRevealKeepAlive();
  return revealKeepAliveData?.viewerRef.current !== undefined;
};
