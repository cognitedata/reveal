import { Button, Dropdown, Menu, ToolBar, Tooltip } from '@cognite/cogs.js';
import styled from 'styled-components';
import { PERCENTAGE_VALUES } from '../constants';
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
            {Object.entries(PERCENTAGE_VALUES).map(([key, value]) => (
              <Menu.Item
                key={`item-percentage-key-${key}`}
                onClick={() => {
                  if (setZoomScale !== undefined) {
                    setZoomScale(value);
                  }
                }}
              >
                {key}
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
