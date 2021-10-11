import React from 'react';
import { useDispatch } from 'react-redux';

import { Icon, Menu } from '@cognite/cogs.js';

import { setDrawMode } from 'modules/map/actions';
import { useMap } from 'modules/map/selectors';

import { MapToolsProp } from './types';

export const SliceToolItem: React.FC<MapToolsProp> = ({
  disabled = false,
  text,
}) => {
  const { drawMode } = useMap();
  const dispatch = useDispatch();

  const handleLineTool = () =>
    // e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    {
      // e.preventDefault();
      // e.stopPropagation();
      // allow for toggle on second click
      // Has to be disabled temp., because cogs Menu.Item doesn't support e

      dispatch(
        setDrawMode(
          drawMode === 'draw_line_string' ? 'simple_select' : 'draw_line_string'
        )
      );
    };

  return (
    <Menu.Item
      onClick={handleLineTool}
      disabled={disabled}
      data-testid="line-button"
    >
      <>
        <Icon type="Slice" />
        <span>{text}</span>
      </>
    </Menu.Item>
  );
};
