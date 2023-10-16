/*!
 * Copyright 2023 Cognite AS
 */

import { useMemo, type ReactElement, useState, useEffect } from 'react';
import { useReveal } from '../RevealContainer/RevealContext';
import { Button, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { MeasurementTool } from '@cognite/reveal/tools';
import { FEET_TO_INCHES, METERS_TO_FEET } from '../../utilities/constants';
import { useTranslation } from '../i18n/I18n';

const distancesInFeetAndMeters = (distanceInMeters: number): string => {
  const distanceInFeet = distanceInMeters * METERS_TO_FEET;
  const distanceInFeetInt = Math.floor(distanceInFeet);
  const distanceInches = Math.round(FEET_TO_INCHES * (distanceInFeet - distanceInFeetInt));
  return `${distanceInMeters.toFixed(2)} m\n ${distanceInFeetInt}' ${distanceInches}''`;
};

export const MeasurementButton = (): ReactElement => {
  const viewer = useReveal();
  const { t } = useTranslation();
  const [measurementEnabled, setMeasurementEnabled] = useState<boolean>(false);

  const measurementTool = useMemo(() => {
    return new MeasurementTool(viewer, {
      distanceToLabelCallback: (distanceInMeters: number) => {
        return distancesInFeetAndMeters(distanceInMeters);
      }
    });
  }, [viewer]);

  const enterMeasurement = (): void => {
    viewer.domElement.style.cursor = 'crosshair';
    measurementTool.enterMeasurementMode();
    measurementTool.visible(true);
  };

  const exitMeasurement = (): void => {
    viewer.domElement.style.cursor = 'default';
    measurementTool.visible(false);
    measurementTool.exitMeasurementMode();
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
      content={t('MEASUREMENTS', 'Distance measuring tool')}
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
