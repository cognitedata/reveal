import { Dropdown, Menu } from '@cognite/cogs.js';
import { useCallback, useEffect, useState } from 'react';
import { useReactFlow, useStore } from 'reactflow';
import styled from 'styled-components';
import ToolBar, { ToolbarButtonProps } from 'components/toolbar/ToolBar';
import { CANVAS_ZOOM_DURATION } from 'common';

export const Controls = () => {
  const [dropdownVisible, setZoomDropdownVisible] = useState(false);
  const [active, setActive] = useState(false); // Keep track of whether the zoom percentage dropdown is active
  const [zoomOutDisabled, setZoomOutDisabled] = useState(false);
  const [zoomInDisabled, setZoomInDisabled] = useState(false);

  const { getViewport, setViewport } = useReactFlow();
  const zoomLevel = useStore((store) => store.transform[2]); // Trackpad zoom level
  const maxZoom = useStore((store) => store.maxZoom);
  const minZoom = useStore((store) => store.minZoom);
  const viewport = getViewport();

  const zoomPercentageArray = [50, 75, 100, 125, 150, 200];

  const handlePanToCenter = useCallback(() => {
    const viewport = getViewport();
    setViewport(
      { x: viewport.x, y: viewport.y, zoom: 1 },
      { duration: CANVAS_ZOOM_DURATION }
    );
  }, [getViewport, setViewport]);

  const handleZoomIn = useCallback(() => {
    const viewport = getViewport();
    const newZoom = viewport.zoom + 0.1;
    if (viewport.zoom < maxZoom) {
      setViewport(
        { x: viewport.x, y: viewport.y, zoom: newZoom },
        { duration: CANVAS_ZOOM_DURATION }
      );
    }
  }, [getViewport, maxZoom, setViewport]);

  const handleZoomOut = useCallback(() => {
    const viewport = getViewport();
    const newZoom = viewport.zoom - 0.1;
    if (viewport.zoom > minZoom) {
      setViewport(
        { x: viewport.x, y: viewport.y, zoom: newZoom },
        { duration: CANVAS_ZOOM_DURATION }
      );
    }
  }, [getViewport, minZoom, setViewport]);

  const handleMenuItemClick = useCallback(
    (selectedPercentage: number) => {
      const viewport = getViewport();
      setViewport(
        { x: viewport.x, y: viewport.y, zoom: selectedPercentage / 100 },
        { duration: CANVAS_ZOOM_DURATION }
      );
    },
    [getViewport, setViewport]
  );

  useEffect(() => {
    if (viewport?.zoom >= maxZoom) {
      setZoomInDisabled(true);
    } else if (viewport?.zoom <= minZoom + 0.1) {
      // Add 0.1 to minZoom to prevent zooming out too much (for some reason, the zoom level is not exactly minZoom)
      setZoomOutDisabled(true);
    } else {
      setZoomInDisabled(false);
      setZoomOutDisabled(false);
    }
  }, [maxZoom, minZoom, viewport]);

  const renderZoomPercentage = () => (
    <Dropdown
      content={
        <StyledMenu className="custom-menu">
          {zoomPercentageArray.map((item) => (
            <Menu.Item key={item} onClick={() => handleMenuItemClick(item)}>
              {item}%
            </Menu.Item>
          ))}
        </StyledMenu>
      }
      onClickOutside={() => {
        setZoomDropdownVisible(false);
        setActive(false);
      }}
      visible={dropdownVisible}
    >
      <ZoomPercentage>{Math.round(zoomLevel * 100)}%</ZoomPercentage>
    </Dropdown>
  );

  const buttons: ToolbarButtonProps[] = [
    {
      icon: 'ZoomOut',
      disabled: zoomOutDisabled,
      onClick: () => {
        handleZoomOut();
      },
    },
    {
      children: renderZoomPercentage(),
      onClick: () => {
        setZoomDropdownVisible(!dropdownVisible);
        setActive(!active);
      },
      activeButton: active,
    },
    {
      icon: 'ZoomIn',
      disabled: zoomInDisabled,
      onClick: () => {
        handleZoomIn();
      },
      divider: true,
      dividerDirection: 'vertical',
    },
    {
      icon: 'FullScreen',
      onClick: handlePanToCenter,
    },
  ];

  return (
    <ToolBar
      toolbarDirection="row"
      buttons={buttons}
      placement="bottomRight"
      gap={4}
    />
  );
};

const ZoomPercentage = styled.div`
  font-size: 12px;
  font-weight: 500;
`;

const StyledMenu = styled(Menu).attrs({
  className: 'custom-menu',
})`
  .custom-menu {
    width: 30px !important;
  }
`;
