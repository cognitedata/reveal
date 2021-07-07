import { HelpCenterContext } from 'context/HelpCenterContext';
import { useContext } from 'react';

const useHelpCenter = () => {
  const { isVisible, setIsVisible } = useContext(HelpCenterContext);

  return {
    isHelpCenterVisible: isVisible,
    toggleHelpCenter: () => setIsVisible(!isVisible),
  };
};

export default useHelpCenter;
