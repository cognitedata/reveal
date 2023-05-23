import { useState, useEffect } from 'react';

const useShowHelpCenter = (): {
  showHelpCenter: boolean;
  setShowHelpCenter: (val: boolean) => void;
} => {
  const [showHelpCenter, setShowHelpCenter] = useState<boolean>(false);

  useEffect(() => {
    window.document.addEventListener('help_icon_onclick', () => {
      setShowHelpCenter(!showHelpCenter);
    });
  }, [showHelpCenter]);

  return { showHelpCenter, setShowHelpCenter };
};

export default useShowHelpCenter;
