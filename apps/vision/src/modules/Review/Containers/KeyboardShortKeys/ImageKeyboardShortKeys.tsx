import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { HotKeys } from '@vision/constants/HotKeys';
import { tools } from '@vision/modules/Review/Components/ReactImageAnnotateWrapper/Tools';
import { setSelectedTool } from '@vision/modules/Review/store/annotatorWrapper/slice';
import { useThunkDispatch } from '@vision/store';

export const ImageKeyboardShortKeys = ({ children }: { children: any }) => {
  const dispatch = useThunkDispatch();

  useHotkeys(
    HotKeys.select_tool,
    () => {
      dispatch(setSelectedTool(tools.SELECT_TOOL));
    },
    []
  );
  useHotkeys(
    HotKeys.pan_tool,
    () => {
      dispatch(setSelectedTool(tools.PAN_TOOL));
    },
    []
  );
  useHotkeys(
    HotKeys.create_point,
    () => {
      dispatch(setSelectedTool(tools.KEYPOINT_TOOL));
    },
    []
  );
  useHotkeys(
    HotKeys.create_bounding_box,
    () => {
      dispatch(setSelectedTool(tools.RECTANGLE_TOOL));
    },
    []
  );
  useHotkeys(
    HotKeys.create_polygon,
    () => {
      dispatch(setSelectedTool(tools.POLYGON_TOOL));
    },
    []
  );
  // todo: line tool temporarily disabled from task [VIS-985] uncomment when it's needed again
  // useHotkeys(
  //   HotKeys.create_line,
  //   () => {
  //     dispatch(setSelectedTool(tools.LINE_TOOL));
  //   },
  //   []
  // );

  return <>{children}</>;
};
