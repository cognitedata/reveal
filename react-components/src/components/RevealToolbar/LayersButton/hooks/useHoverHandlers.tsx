import { useRef, useState } from 'react';

export const useHoverHandlers = (isDisabled: boolean) => {
    const closeTimeoutRef = useRef<number | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const setPanelToClose = () => setIsPanelOpen(false)

    const openPanel = () => {
        if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
        }
        if (!isDisabled) {
        setIsPanelOpen(true);
        }
    };
    const closePanel = () => {
        closeTimeoutRef.current = window.setTimeout(() => {
            setPanelToClose();
            closeTimeoutRef.current = null;
        }, 100); 
    };

    const hoverHandlers = {
        onMouseEnter: openPanel,
        onMouseLeave: closePanel,
    };

    return {hoverHandlers, isPanelOpen, setPanelToClose}
}