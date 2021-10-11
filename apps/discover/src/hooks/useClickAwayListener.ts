import { MutableRefObject, useEffect } from 'react';

export const useClickAwayListener = (
  ref: MutableRefObject<HTMLHeadingElement | null>,
  clickOutside: (ev: Event) => void
) => {
  /**
   * clicked on outside of element
   */
  const handleClickOutside = (event: Event) => {
    if (ref.current && !ref?.current?.contains(event.target as Node)) {
      // NOTE when this is used on popup with button, event get fired when clicking on the button to close the popup.
      // But if button also have an own event, then it conflict with this event. To resolve that use timeout
      // to wait until button event get finished and then fire this event.
      setTimeout(() => {
        clickOutside(event);
      }, 100);
    }
  };

  useEffect(() => {
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, ref.current]);
};
