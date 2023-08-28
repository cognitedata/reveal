import { KeyboardEventHandler, useRef } from 'react';

import { UnifiedViewer } from '@cognite/unified-file-viewer';

import { MetricEvent } from '../constants';
import {
  redo,
  setToolType,
  undo,
  useIndustrialCanvasStore,
} from '../state/useIndustrialCanvasStore';
import { IndustryCanvasToolType } from '../types';
import useMetrics from '../utils/tracking/useMetrics';

const useKeyboardShortcuts = (unifiedViewerRef: UnifiedViewer | null) => {
  const trackUsage = useMetrics();

  const { toolType } = useIndustrialCanvasStore((state) => ({
    toolType: state.toolType,
  }));

  const toolBeforeSpacePress = useRef<IndustryCanvasToolType | undefined>(
    undefined
  );

  const onKeyUp: KeyboardEventHandler<HTMLElement> = (event) => {
    if (event.key === ' ' && toolBeforeSpacePress.current !== undefined) {
      setToolType(toolBeforeSpacePress.current);
      toolBeforeSpacePress.current = undefined;
    }
  };

  const onKeyDown: KeyboardEventHandler<HTMLElement> = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
      if (event.shiftKey) {
        event.stopPropagation();
        event.preventDefault();
        redo();
        trackUsage(MetricEvent.HOTKEYS_USED, {
          hotkey: 'Ctrl/Cmd + Shift + Z',
        });
        return;
      }

      event.stopPropagation();
      event.preventDefault();
      undo();
      trackUsage(MetricEvent.HOTKEYS_USED, {
        hotkey: 'Ctrl/Cmd + Z',
      });
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      trackUsage(MetricEvent.HOTKEYS_USED, {
        hotkey: 'Ctrl/Cmd + F',
      });
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.stopPropagation();
      event.preventDefault();
      trackUsage(MetricEvent.HOTKEYS_USED, {
        hotkey: 'Ctrl/Cmd + S',
      });
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
      event.stopPropagation();
      event.preventDefault();
      trackUsage(MetricEvent.HOTKEYS_USED, {
        hotkey: 'Ctrl/Cmd + A',
      });
      return;
    }

    if (event.key === 'Escape') {
      event.stopPropagation();
      event.preventDefault();
      unifiedViewerRef?.selectByIds({
        containerIds: [],
        annotationIds: [],
      });
      return;
    }

    if (event.key === ' ') {
      // Only record the previous tool *before* the space key was pressed.
      // Otherwise, we will record the tool while space is being pressed
      if (toolBeforeSpacePress.current === undefined) {
        toolBeforeSpacePress.current = toolType;
      }
      setToolType(IndustryCanvasToolType.PAN);
    }
  };

  return {
    onKeyDown,
    onKeyUp,
  };
};

export default useKeyboardShortcuts;
