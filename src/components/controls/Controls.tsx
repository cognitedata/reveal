import { Dropdown, Menu } from '@cognite/cogs.js';
import { useCallback, useState, useEffect } from 'react';
import { useReactFlow, useStore } from 'reactflow';
import styled from 'styled-components';
import ToolBar, { ToolbarButtonProps } from 'components/toolbar/ToolBar';

export const Controls = () => {
  const [zoomPercentage, setZoomPercentage] = useState<number>(100);
  const [zoomDropdownVisible, setZoomDropdownVisible] =
    useState<boolean>(false);
  const [wasZoomClicked, setWasZoomClicked] = useState({
    wasZoomInClicked: false,
    wasZoomOutClicked: false,
  }); // Keep track of whether the zoom in/out buttons were clicked so that the trackpad zoom works in tandem with the buttons
  const [active, setActive] = useState(false); // Keep track of whether the zoom percentage dropdown is active

  const { setViewport, zoomIn, zoomOut } = useReactFlow();
  const zoomLevel = useStore((store) => store.transform[2]); // Trackpad zoom level
  const isMaxZoom = useStore((store) => store.transform[2] === store.maxZoom);
  const isMinZoom = useStore((store) => store.transform[2] === store.minZoom);

  const zoomPercentageArray = [50, 75, 100, 125, 150, 200];

  const handlePanToCenter = useCallback(() => {
    setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 800 });
    setZoomPercentage(100);
  }, [setViewport]);

  const handleZoomIn = useCallback(() => {
    if (wasZoomClicked.wasZoomInClicked) {
      setZoomPercentage((prev: number) => prev + 10);
    }
    setWasZoomClicked({ wasZoomInClicked: false, wasZoomOutClicked: false }); // Reset zoom click state so that the trackpad zoom works in the useEffect below
    zoomIn({ duration: 500 });
  }, [wasZoomClicked, zoomIn]);

  const handleZoomOut = useCallback(() => {
    if (wasZoomClicked.wasZoomOutClicked) {
      setZoomPercentage((prev: number) => prev - 10);
    }
    setWasZoomClicked({ wasZoomInClicked: false, wasZoomOutClicked: false }); // Reset zoom click state so that the trackpad zoom works in the useEffect below
    zoomOut({ duration: 500 });
  }, [wasZoomClicked.wasZoomOutClicked, zoomOut]);

  const handleMenuItemClick = useCallback(
    (selectedPercentage: number) => {
      setViewport(
        { x: 0, y: 0, zoom: selectedPercentage / 100 },
        { duration: 800 }
      );
      setZoomPercentage(selectedPercentage);
    },
    [setViewport]
  );

  useEffect(() => {
    // Only update zoom percentage for trackpad zoom if the zoom buttons were not clicked
    if (!wasZoomClicked.wasZoomInClicked && !wasZoomClicked.wasZoomOutClicked) {
      setZoomPercentage(Math.round(zoomLevel * 100));
    }
  }, [
    wasZoomClicked.wasZoomInClicked,
    wasZoomClicked.wasZoomOutClicked,
    zoomLevel,
  ]);

  const renderZoomPercentage = () => (
    <StyledDropdown
      content={
        <Menu>
          {zoomPercentageArray.map((item) => (
            <Menu.Item key={item} onClick={() => handleMenuItemClick(item)}>
              {`${item}%`}
            </Menu.Item>
          ))}
        </Menu>
      }
      onClickOutside={() => {
        setZoomDropdownVisible(false);
        setActive(false);
      }}
      placement="bottom-end"
      visible={zoomDropdownVisible}
      maxWidth="30px"
    >
      <ZoomPercentage>{`${zoomPercentage}%`}</ZoomPercentage>
    </StyledDropdown>
  );
  //console.log(wasZoomClicked);
  //console.log(zoomPercentage);
  //console.log('active', active);

  const buttons: ToolbarButtonProps[] = [
    {
      icon: 'ZoomOut',
      disabled: isMinZoom,
      onClick: () => {
        setWasZoomClicked({ wasZoomOutClicked: true, wasZoomInClicked: false });
        handleZoomOut();
      },
    },
    {
      children: renderZoomPercentage(),
      onClick: () => {
        setZoomDropdownVisible(!zoomDropdownVisible);
        setActive(!active);
      },
      activeButton: active,
    },
    {
      icon: 'ZoomIn',
      disabled: isMaxZoom,
      onClick: () => {
        setWasZoomClicked({ wasZoomOutClicked: false, wasZoomInClicked: true });
        handleZoomIn();
      },
      divider: true,
    },
    {
      icon: 'FullScreen',
      onClick: handlePanToCenter,
    },
  ];

  return <ToolBar buttons={buttons} />;
};

const ZoomPercentage = styled.div`
  font-size: 12px;
  font-weight: 500;
`;

const StyledDropdown = styled(Dropdown)`
  width: 30px;
`;
