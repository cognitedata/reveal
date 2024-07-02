/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useState, useEffect, useCallback } from 'react';
import { useReveal } from '../RevealCanvas/ViewerContext';
import { Button, Tooltip as CogsTooltip, RulerIcon } from '@cognite/cogs.js';
import { type Measurement } from '@cognite/reveal/tools';
import { FEET_TO_INCHES, METERS_TO_FEET } from '../../utilities/constants';
import { useTranslation } from '../i18n/I18n';
import {
  useAddMeasurementsToUrl,
  useInitializedMeasurementTool
} from './hooks/measurementUrlStateHooks';

export const distancesInFeetAndMeters = (distanceInMeters: number): string => {
  const distanceInFeet = distanceInMeters * METERS_TO_FEET;
  const distanceInFeetInt = Math.floor(distanceInFeet);
  const distanceInches = Math.round(FEET_TO_INCHES * (distanceInFeet - distanceInFeetInt));
  return `${distanceInMeters.toFixed(2)} m\n ${distanceInFeetInt}' ${distanceInches}''`;
};

export type MeasurementButtonProps = {
  storeStateInUrl?: boolean;
  onMeasurementsUpdate?: (measurements: Measurement[]) => void;
};

export const MeasurementButton = ({
  storeStateInUrl = true,
  onMeasurementsUpdate
}: MeasurementButtonProps): ReactElement => {
  const viewer = useReveal();
  const { t } = useTranslation();
  const [measurementEnabled, setMeasurementEnabled] = useState<boolean>(false);

  const measurementTool = useInitializedMeasurementTool(storeStateInUrl);
  const persistMeasurementsToUrl = useAddMeasurementsToUrl(storeStateInUrl);

  const measurementAddedCallback = useCallback(() => {
    const measurements = measurementTool.getAllMeasurements();
    onMeasurementsUpdate?.(measurements);
    persistMeasurementsToUrl(measurements);
  }, [measurementTool, onMeasurementsUpdate, persistMeasurementsToUrl]);

  const enterMeasurement = (): void => {
    viewer.domElement.style.cursor = 'crosshair';
    measurementTool.enterMeasurementMode();
    measurementTool.visible(true);
    measurementTool.on('added', measurementAddedCallback);
  };

  const exitMeasurement = (): void => {
    viewer.domElement.style.cursor = 'default';
    measurementTool.visible(false);
    measurementTool.exitMeasurementMode();
    measurementTool.off('added', measurementAddedCallback);
  };

  const toggleMeasurementEnabled = (): void => {
    if (viewer.models.length <= 0) {
      return;
    }
    setMeasurementEnabled((prevState) => !prevState);
  };

  useEffect(() => {
    if (measurementEnabled) {
      enterMeasurement();
      return () => {
        exitMeasurement();
      };
    }
  }, [measurementEnabled]);

  return (
    <CogsTooltip
      content={t('MEASUREMENTS_TOOLTIP', 'Distance measuring tool')}
      placement="right"
      appendTo={document.body}>
      <Button
        type="ghost"
        icon=<RulerIcon />
        toggled={measurementEnabled}
        aria-label="Make measurements"
        onClick={toggleMeasurementEnabled}
      />
    </CogsTooltip>
  );
};
