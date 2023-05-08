import { useState } from 'react';

interface UseDialogProps {
  isOpen?: boolean;
}

/**
 * This custom hook can be used to help handle common open, close, or toggle scenarios. It can be used to control feedback component such as Modal, AlertDialog, Drawer, etc.
 * @param props {isOpen:Boolean}
 * @returns
 */
export const useDialog = (props?: UseDialogProps) => {
  const [isOpen, setIsOpen] = useState(false || !!props?.isOpen);

  const open = () => {
    setIsOpen(true);
  };
  const close = () => {
    setIsOpen(false);
  };

  const toggle = () => {
    setIsOpen((prev) => !prev);
  };

  return { isOpen, open, close, toggle };
};
