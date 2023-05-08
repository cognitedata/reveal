import { ToolType } from '@cognite/unified-file-viewer';
import { useEffect, useState } from 'react';
import { ToolTypeByShortcutKey } from '../components/ToolbarComponent/ToolbarComponent';
import shouldFireToolKeyboardShortcut from './shouldFireToolKeyboardShortcut';

const useManagedTool = (initialToolType: ToolType) => {
  const [tool, setTool] = useState<ToolType>(initialToolType);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!shouldFireToolKeyboardShortcut(event)) {
        return;
      }

      const matchingToolType = ToolTypeByShortcutKey[event.key];
      if (matchingToolType !== undefined) {
        setTool(matchingToolType);
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
