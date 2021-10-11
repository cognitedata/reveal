import React from 'react';
import { useDispatch } from 'react-redux';

import { Icon, Menu } from '@cognite/cogs.js';

import { setDrawMode } from 'modules/map/actions';
import { useMap } from 'modules/map/selectors';

import { MapToolWrapper } from './elements';
import { MapToolsProp } from './types';

export const PolygonToolItem: React.FC<MapToolsProp> = ({
  disabled = false,
  text,
}) => {
  const { drawMode } = useMap();
  const dispatch = useDispatch();

  const handlePolygonDrawTool = () =>
    // e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    {
      // Has to be disabled temp., because cogs Menu.Item doesn't support e
      // e.preventDefault();
      // e.stopPropagation();
      // allow for toggle on second click
      dispatch(
        setDrawMode(
          drawMode === 'draw_free_polygon'
            ? 'simple_select'
            : 'draw_free_polygon'
        )
      );
    };

  return (
    <MapToolWrapper>
      <Menu.Item
        onClick={handlePolygonDrawTool}
        data-testid="freedraw-button"
        disabled={disabled}
      >
        <>
          <Icon type="Polygon" />
          <span>{text}</span>
        </>
      </Menu.Item>
    </MapToolWrapper>
  );
};
