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

  const removeTimeout = useCallback((): void => {
    if (closeTimeoutRef.current !== null) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return removeTimeout;
  }, [removeTimeout]);

  const setPanelToClose = useCallback((): void => {
    removeTimeout();
    setIsPanelOpen(false);
  }, [removeTimeout]);

  const openPanel = useCallback((): void => {
    removeTimeout();
    if (!isDisabled) {
      setIsPanelOpen(true);
    }
  }, [isDisabled, removeTimeout]);

  const closePanel = useCallback((): void => {
    removeTimeout();
    if (!isDisabled) {
      closeTimeoutRef.current = window.setTimeout(setPanelToClose, 100);
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
