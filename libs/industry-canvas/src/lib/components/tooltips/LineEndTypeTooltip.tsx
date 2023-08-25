import React from 'react';

import { Button, ToolBar } from '@cognite/cogs.js';
import { PolylineEndType } from '@cognite/unified-file-viewer';

import { translationKeys } from '../../common';
import { useTranslation } from '../../hooks/useTranslation';

export type LineEndTypeTooltipProps = {
  selectedStartEndType: PolylineEndType | undefined;
  selectedEndEndType: PolylineEndType | undefined;
  onUpdateEndType: (endType: {
    startEndType?: PolylineEndType;
    endEndType?: PolylineEndType;
  }) => void;
};

export const LineEndTypeTooltip: React.FC<LineEndTypeTooltipProps> = ({
  selectedStartEndType = PolylineEndType.NONE,
  selectedEndEndType = PolylineEndType.NONE,
  onUpdateEndType,
}) => {
  const { t } = useTranslation();

  return (
    <ToolBar direction="horizontal">
      <>
        <Button
          key="left-arrow"
          className="cogs-button--icon-only"
          aria-label={t(translationKeys.ARROW_LEFT_ICON, 'arrow left')}
          type="ghost"
          icon="ArrowLeft"
          toggled={selectedStartEndType === PolylineEndType.ARROW}
          onClick={() =>
            onUpdateEndType({
              startEndType: PolylineEndType.ARROW,
              endEndType: selectedEndEndType,
            })
          }
        />
        <Button
          key="left-line"
          className="cogs-button--icon-only"
          aria-label="left-line"
          type="ghost"
          icon="RemoveLarge"
          toggled={selectedStartEndType === PolylineEndType.NONE}
          onClick={() =>
            onUpdateEndType({
              startEndType: PolylineEndType.NONE,
              endEndType: selectedEndEndType,
            })
          }
        />
      </>
      <>
        <Button
          key="right-line"
          className="cogs-button--icon-only"
          aria-label="right-line"
          type="ghost"
          icon="RemoveLarge"
          toggled={selectedEndEndType === PolylineEndType.NONE}
          onClick={() =>
            onUpdateEndType({
              startEndType: selectedStartEndType,
              endEndType: PolylineEndType.NONE,
            })
          }
        />
        <Button
          key="right-arrow"
          className="cogs-button--icon-only"
          aria-label="right-arrow"
          type="ghost"
          icon="ArrowRight"
          toggled={selectedEndEndType === PolylineEndType.ARROW}
          onClick={() =>
            onUpdateEndType({
              startEndType: selectedStartEndType,
              endEndType: PolylineEndType.ARROW,
            })
          }
        />
      </>
    </ToolBar>
  );
};
