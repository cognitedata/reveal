import { useState } from 'react';

interface UseDisclosureProps {
  isOpen?: boolean;
}

/**
 * This hooks can be use to deal with modal visible state and return the function to open and close functions
 * @param props {isOpen:Boolean}
 * @returns
 */
export const useDisclosure = (props?: UseDisclosureProps) => {
  const [isOpen, setIsOpen] = useState(false || !!props?.isOpen);

  const onOpen = () => {
    setIsOpen(true);
  };
  const onClose = () => {
    setIsOpen(false);
  };

  const onToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return { isOpen, onOpen, onClose, onToggle };
};
