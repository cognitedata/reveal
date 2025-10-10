import { useRef, useState, useCallback, useMemo, useEffect } from 'react';

export type UseHoverHandlersProps = { isDisabled: boolean };
export type UseHoverHandlersReturnType = {
  hoverHandlers: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
  isPanelOpen: boolean;
  setPanelToClose: () => void;
};

export const useHoverHandlers = (
  isDisabled: UseHoverHandlersProps['isDisabled']
): UseHoverHandlersReturnType => {
  const closeTimeoutRef = useRef<number | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const removeTimeout = (): void => {
    if (closeTimeoutRef.current !== null) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      removeTimeout();
    };
  }, []);

  const setPanelToClose = useCallback((): void => {
    setIsPanelOpen(false);
  }, []);

  const openPanel = useCallback((): void => {
    removeTimeout();
    if (!isDisabled) {
      setIsPanelOpen(true);
    }
  }, [isDisabled]);

  const closePanel = useCallback((): void => {
    if (!isDisabled) {
      closeTimeoutRef.current = window.setTimeout(() => {
        setPanelToClose();
        closeTimeoutRef.current = null;
      }, 100);
    }
  }, [isDisabled, setPanelToClose]);

  const hoverHandlers = useMemo(
    () => ({
      onMouseEnter: openPanel,
      onMouseLeave: closePanel
    }),
    [openPanel, closePanel]
  );

  return { hoverHandlers, isPanelOpen, setPanelToClose };
};
