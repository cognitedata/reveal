import React from 'react';
import { useDispatch } from 'react-redux';
import { tools } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/Tools';
import { useHotkeys } from 'react-hotkeys-hook';
import { HotKeys } from 'src/constants/HotKeys';
import { setSelectedTool } from 'src/modules/Review/store/annotatorWrapper/slice';

export const ImageKeyboardShortKeys = ({ children }: { children: any }) => {
  const dispatch = useDispatch();

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
  // todo: line tool temporarily disabled from task [VIS-985] uncomment when it's added back again
  // useHotkeys(
  //   HotKeys.create_line,
  //   () => {
  //     dispatch(setSelectedTool(tools.LINE_TOOL));
  //   },
  //   []
  // );

  return <>{children}</>;
};
