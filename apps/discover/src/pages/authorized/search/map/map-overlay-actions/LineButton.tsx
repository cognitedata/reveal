import React from 'react';
import { useDispatch } from 'react-redux';

import { Button, Tooltip } from '@cognite/cogs.js';

import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useTranslation } from 'hooks/useTranslation';
import { setDrawMode } from 'modules/map/actions';
import { useMap } from 'modules/map/selectors';
import { useSelectedSurvey } from 'modules/seismicSearch/hooks';

import { ButtonContainer } from './elements';

const TOOLTIP_TEXT = 'Line draw';

export const LineButton: React.FC<{ disabled?: boolean }> = React.memo(
  ({ disabled }) => {
    const metrics = useGlobalMetrics('map');
    const { drawMode } = useMap();
    const dispatch = useDispatch();
    const { t } = useTranslation('Search');
    const selected = drawMode === 'draw_line_string';
    const { data: selectedSurveyData } = useSelectedSurvey();

    const handleLineTool = (
      e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
      e.preventDefault();
      e.stopPropagation();
      metrics.track(
        `click-${drawMode ? 'enable' : 'disable'}-line-mode-button`
      );
      // allow for toggle on second click
      dispatch(
        setDrawMode(
          drawMode === 'draw_line_string' ? 'simple_select' : 'draw_line_string'
        )
      );
    };

    if (!selectedSurveyData) {
      return null;
    }

    return (
      <ButtonContainer selected={selected}>
        <Tooltip content={t(TOOLTIP_TEXT) as string}>
          <Button
            type="ghost"
            icon="VectorLine"
            disabled={disabled}
            onClick={handleLineTool}
            aria-label={t(TOOLTIP_TEXT)}
            data-testid="line-button"
          />
        </Tooltip>
      </ButtonContainer>
    );
  }
);

export default LineButton;
