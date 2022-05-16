import React, { useMemo } from 'react';
import { GlobalHotKeys } from 'react-hotkeys';
import { useDispatch } from 'react-redux';
import { hotKeyMap } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/HotKeyMap';
import { tools } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/Tools';
import { setSelectedTool } from 'src/modules/Review/store/annotationLabel/slice';
import { AppDispatch } from 'src/store';

export const ImageKeyboardShortKeys = ({ children }: { children: any }) => {
  const dispatch: AppDispatch = useDispatch();

  const hotkeyHandlers = useMemo(() => {
    return {
      select_tool: () => dispatch(setSelectedTool(tools.SELECT_TOOL)),
      pan_tool: () => dispatch(setSelectedTool(tools.PAN_TOOL)),
      create_point: () => dispatch(setSelectedTool(tools.KEYPOINT_TOOL)),
      create_bounding_box: () =>
        dispatch(setSelectedTool(tools.RECTANGLE_TOOL)),
      create_polygon: () => dispatch(setSelectedTool(tools.POLYGON_TOOL)),
      create_line: () => dispatch(setSelectedTool(tools.LINE_TOOL)),
    };
  }, []);

  return (
    <GlobalHotKeys keyMap={hotKeyMap} handlers={hotkeyHandlers}>
      {children}
    </GlobalHotKeys>
  );
};
