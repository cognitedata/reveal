import styled from 'styled-components';

import { Button, Dropdown, Menu, ToolBar, Tooltip } from '@cognite/cogs.js';

import { ZOOM_LEVELS } from '../constants';
import convertToPercentage from '../utils/convertToPercentage';

export type ZoomControlsProps = {
  currentZoomScale: number;
  zoomIn?: () => void;
  zoomOut?: () => void;
  zoomToFit?: () => void;
  setZoomScale?: (newScale: number) => void;
};

const ZoomControls: React.FC<ZoomControlsProps> = ({
  currentZoomScale,
  zoomIn,
  zoomOut,
  zoomToFit,
  setZoomScale,
}) => (
  <ToolBar direction="horizontal">
    <>
      <Tooltip content="Zoom out">
        <Button
          aria-label="ZoomOut"
          type="ghost"
          icon="ZoomOut"
          size="small"
          onClick={zoomOut}
        />
      </Tooltip>
      <Dropdown
        placement="top-start"
        content={
          <Menu>
            {ZOOM_LEVELS.map((zoomValue) => (
              <Menu.Item
                key={`item-percentage-key-${zoomValue}`}
                onClick={() => {
                  if (setZoomScale !== undefined) {
                    setZoomScale(zoomValue);
                  }
                }}
              >
                {`${Math.round(zoomValue * 100)}%`}
              </Menu.Item>
            ))}
          </Menu>
        }
      >
        <PercentageButton
          aria-label="CurrentZoomScale"
          type="ghost"
          size="small"
        >
          {convertToPercentage(currentZoomScale)}%
        </PercentageButton>
      </Dropdown>
      <Tooltip content="Zoom in">
        <Button
          aria-label="ZoomIn"
          type="ghost"
          icon="ZoomIn"
          size="small"
          onClick={zoomIn}
        />
      </Tooltip>
    </>
    <Tooltip content="Fit contents in view">
      <Button
        aria-label="Fit contents in view"
        type="ghost"
        icon="Expand"
        onClick={zoomToFit}
      />
    </Tooltip>
  </ToolBar>
);

const PercentageButton = styled(Button)`
  width: 50px;
`;

export default ZoomControls;
