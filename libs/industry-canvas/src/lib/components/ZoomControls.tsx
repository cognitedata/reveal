import styled from 'styled-components';

import { Button, Dropdown, Menu, ToolBar, Tooltip } from '@cognite/cogs.js';

import { translationKeys } from '../common';
import { ZOOM_LEVELS } from '../constants';
import { useTranslation } from '../hooks/useTranslation';
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
}) => {
  const { t } = useTranslation();
  return (
    <ToolBar direction="horizontal">
      <>
        <Tooltip content={t(translationKeys.ZOOM_OUT_CONTROL, 'Zoom out')}>
          <Button
            aria-label={t(translationKeys.ZOOM_OUT_CONTROL, 'Zoom out')}
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
        <Tooltip content={t(translationKeys.ZOOM_IN_CONTROL, 'Zoom in')}>
          <Button
            aria-label={t(translationKeys.ZOOM_IN_CONTROL, 'Zoom in')}
            type="ghost"
            icon="ZoomIn"
            size="small"
            onClick={zoomIn}
          />
        </Tooltip>
      </>
      <Tooltip
        content={t(translationKeys.ZOOM_FIT_CONTENT, 'Fit contents in view')}
      >
        <Button
          aria-label={t(
            translationKeys.ZOOM_FIT_CONTENT,
            'Fit contents in view'
          )}
          type="ghost"
          icon="Expand"
          onClick={zoomToFit}
        />
      </Tooltip>
    </ToolBar>
  );
};

const PercentageButton = styled(Button)`
  width: 50px;
`;

export default ZoomControls;
