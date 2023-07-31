import { HelpCenterContext } from 'context/HelpCenterContext';
import { useContext } from 'react';

export default () => {
  const { isVisible, setIsVisible } = useContext(HelpCenterContext);

  return {
    isHelpCenterVisible: isVisible,
    toggleHelpCenter: () => setIsVisible(!isVisible),
  };
};
