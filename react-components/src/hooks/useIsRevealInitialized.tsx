import { useRevealKeepAlive } from '../components/RevealKeepAlive/RevealKeepAliveContext';

export const useIsRevealInitialized = (): boolean => {
  const revealKeepAliveData = useRevealKeepAlive();
  return revealKeepAliveData?.renderTargetRef.current !== undefined;
};
