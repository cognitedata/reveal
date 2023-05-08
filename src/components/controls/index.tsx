import { Dropdown, Menu } from '@cognite/cogs.js';
import { useCallback, useState } from 'react';
import { useReactFlow, useStore } from 'reactflow';
import styled from 'styled-components';
import ToolBar, { ToolbarButtonProps } from 'components/toolbar/ToolBar';
import { CANVAS_ZOOM_DURATION } from 'common';

export const Controls = () => {
  const [dropdownVisible, setZoomDropdownVisible] = useState<boolean>(false);
  const [active, setActive] = useState(false); // Keep track of whether the zoom percentage dropdown is active

  const { getViewport, setViewport } = useReactFlow();
  const zoomLevel = useStore((store) => store.transform[2]); // Trackpad zoom level
  const maxZoom = useStore((store) => store.transform[2] === store.maxZoom);
  const minZoom = useStore((store) => store.transform[2] === store.minZoom);

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
    setViewport(
      { x: viewport.x, y: viewport.y, zoom: viewport.zoom + 0.1 },
      { duration: CANVAS_ZOOM_DURATION }
    );
  }, [setViewport, getViewport]);

  const handleZoomOut = useCallback(() => {
    const viewport = getViewport();
    setViewport(
      { x: viewport.x, y: viewport.y, zoom: viewport.zoom - 0.1 },
      { duration: CANVAS_ZOOM_DURATION }
    );
  }, [setViewport, getViewport]);

  const handleMenuItemClick = useCallback(
    (selectedPercentage: number) => {
      setViewport(
        { x: 0, y: 0, zoom: selectedPercentage / 100 },
        { duration: 800 }
      );
    },
    [setViewport]
  );

  const renderZoomPercentage = () => (
    <Dropdown
      content={
        <StyledMenu className="custom-menu">
          {zoomPercentageArray.map((item) => (
            <Menu.Item key={item} onClick={() => handleMenuItemClick(item)}>
              {`${item}%`}
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
      <ZoomPercentage>{`${Math.round(zoomLevel * 100)}%`}</ZoomPercentage>
    </Dropdown>
  );

  const buttons: ToolbarButtonProps[] = [
    {
      icon: 'ZoomOut',
      disabled: minZoom,
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
      disabled: maxZoom,
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
      placement="topRight"
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
