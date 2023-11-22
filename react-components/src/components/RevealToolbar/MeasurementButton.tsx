/*!
 * Copyright 2023 Cognite AS
 */

import { useMemo, type ReactElement, useState, useEffect, useCallback } from 'react';
import { useReveal } from '../RevealContainer/RevealContext';
import { Button, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { type Measurement, MeasurementTool } from '@cognite/reveal/tools';
import { FEET_TO_INCHES, METERS_TO_FEET } from '../../utilities/constants';
import { useTranslation } from '../i18n/I18n';

export const distancesInFeetAndMeters = (distanceInMeters: number): string => {
  const distanceInFeet = distanceInMeters * METERS_TO_FEET;
  const distanceInFeetInt = Math.floor(distanceInFeet);
  const distanceInches = Math.round(FEET_TO_INCHES * (distanceInFeet - distanceInFeetInt));
  return `${distanceInMeters.toFixed(2)} m\n ${distanceInFeetInt}' ${distanceInches}''`;
};

export type MeasurementButtonProps = {
  measurementTool?: MeasurementTool;
  onMeasurementsUpdate?: (measurements: Measurement[]) => void;
};

export const MeasurementButton = ({
  measurementTool: inputMeasurementTool,
  onMeasurementsUpdate
}: MeasurementButtonProps): ReactElement => {
  const viewer = useReveal();
  const { t } = useTranslation();
  const [measurementEnabled, setMeasurementEnabled] = useState<boolean>(false);

  const measurementTool = useMemo(() => {
    return (
      inputMeasurementTool ??
      new MeasurementTool(viewer, {
        distanceToLabelCallback: (distanceInMeters: number) => {
          return distancesInFeetAndMeters(distanceInMeters);
        }
      })
    );
  }, [viewer, inputMeasurementTool]);

  const measurementAddedCallback = useUpdateMeasurementsCallback(
    onMeasurementsUpdate,
    measurementTool
  );

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

  const handleMeasurement = (_enable: boolean): void => {
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
        icon="Ruler"
        toggled={measurementEnabled}
        aria-label="Make measurements"
        onClick={() => {
          handleMeasurement(!measurementEnabled);
        }}
      />
    </CogsTooltip>
  );
};

const useUpdateMeasurementsCallback = (
  onMeasurementsUpdate: ((measurements: Measurement[]) => void) | undefined,
  measurementTool: MeasurementTool
): (() => void) => {
  return useCallback(() => {
    onMeasurementsUpdate?.(measurementTool.getAllMeasurements());
  }, [measurementTool, onMeasurementsUpdate]);
};
