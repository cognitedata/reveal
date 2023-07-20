import { useEffect, useState } from 'react';

import { IndustryCanvasToolTypeByShortcutKey } from '../components/ToolbarComponent/ToolbarComponent';
import { IndustryCanvasToolType } from '../types';

import shouldFireToolKeyboardShortcut from './shouldFireToolKeyboardShortcut';

const useManagedTool = (
  initialIndustryCanvasToolType: IndustryCanvasToolType
) => {
  const [toolType, setToolType] = useState<IndustryCanvasToolType>(
    initialIndustryCanvasToolType
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!shouldFireToolKeyboardShortcut(event)) {
        return;
      }

      const matchingIndustryCanvasToolType =
        IndustryCanvasToolTypeByShortcutKey[event.key];
      if (matchingIndustryCanvasToolType !== undefined) {
        setToolType(matchingIndustryCanvasToolType);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [setToolType]);

  return {
    toolType,
    setToolType,
  };
};

export default useManagedTool;
