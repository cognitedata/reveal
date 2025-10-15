import { useRef, useState, useCallback, useMemo, useEffect } from 'react';

export type UseHoverHandlersReturnType = {
  hoverHandlers: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
  isPanelOpen: boolean;
  setPanelToClose: () => void;
};

export const useHoverHandlers = (isDisabled: boolean): UseHoverHandlersReturnType => {
  const closeTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const isMountedRef = useRef(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const removeTimeout = useCallback((): void => {
    if (closeTimeoutRef.current !== null) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      removeTimeout();
    };
  }, [removeTimeout]);

  const setPanelToClose = useCallback((): void => {
    removeTimeout();
    if (isMountedRef.current) {
      setIsPanelOpen(false);
    }
  }, [removeTimeout]);

  useEffect(() => {
    if (isDisabled) {
      setPanelToClose();
    }
  }, [isDisabled, setPanelToClose]);

  const openPanel = useCallback((): void => {
    removeTimeout();
    if (!isDisabled) {
      setIsPanelOpen(true);
    }
  }, [isDisabled, removeTimeout]);

  const closePanel = useCallback((): void => {
    removeTimeout();
    if (!isDisabled) {
      closeTimeoutRef.current = setTimeout(setPanelToClose, 100);
    }
  }, [isDisabled, setPanelToClose, removeTimeout]);

  const hoverHandlers = useMemo(
    () => ({
      onMouseEnter: openPanel,
      onMouseLeave: closePanel
    }),
    [openPanel, closePanel]
  );

  return { hoverHandlers, isPanelOpen, setPanelToClose };
};
