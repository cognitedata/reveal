import { useRef, useState } from 'react';

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

  const setPanelToClose = (): void => {
    setIsPanelOpen(false);
  };

  const openPanel = (): void => {
    if (closeTimeoutRef.current !== null) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (!isDisabled) {
      setIsPanelOpen(true);
    }
  };

  const closePanel = (): void => {
    closeTimeoutRef.current = window.setTimeout(() => {
      setPanelToClose();
      closeTimeoutRef.current = null;
    }, 100);
  };

  const hoverHandlers = {
    onMouseEnter: openPanel,
    onMouseLeave: closePanel
  };

  return { hoverHandlers, isPanelOpen, setPanelToClose };
};
