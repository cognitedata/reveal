import { useEffect, useState } from 'react';

import { IndustryCanvasToolTypeByShortcutKey } from '../components/ToolbarComponent/ToolbarComponent';
import { IndustryCanvasToolType } from '../types';

import shouldFireToolKeyboardShortcut from './shouldFireToolKeyboardShortcut';

const useManagedTool = (
  initialIndustryCanvasToolType: IndustryCanvasToolType
) => {
  const [tool, setTool] = useState<IndustryCanvasToolType>(
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
        setTool(matchingIndustryCanvasToolType);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [setTool]);

  return {
    tool,
    setTool,
  };
};

export default useManagedTool;
