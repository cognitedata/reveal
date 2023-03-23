import { Button, Dropdown, Menu, ToolBar } from '@cognite/cogs.js';
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
      <Button
        aria-label="ZoomOut"
        type="ghost"
        icon="ZoomOut"
        size="small"
        onClick={zoomOut}
      />
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
      <Button
        aria-label="ZoomIn"
        type="ghost"
        icon="ZoomIn"
        size="small"
        onClick={zoomIn}
      />
    </>
    <Button
      aria-label="Expand"
      type="ghost"
      icon="Expand"
      onClick={zoomToFit}
    />
  </ToolBar>
);

const PercentageButton = styled(Button)`
  width: 50px;
`;

export default ZoomControls;
