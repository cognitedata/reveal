/*!
 * Copyright 2023 Cognite AS
 */

import { useMemo, type ReactElement, useState } from 'react';
import { useReveal } from '../RevealContainer/RevealContext';
import { Button } from '@cognite/cogs.js';
import { MeasurementTool } from '@cognite/reveal/tools';

const distancesInFeetAndMeters = (distanceInMeters: number): string => {
  const distanceInFeet = distanceInMeters * 3.281;
  const distanceInFeetInt = Math.floor(distanceInFeet);
  const distanceInches = Math.round(12 * (distanceInFeet - distanceInFeetInt));
  const distances = `${distanceInMeters.toFixed(2)} m\n ${distanceInFeetInt}' ${distanceInches}''`;
  return distances;
};

export const MeasurementButton = (): ReactElement => {
  const viewer = useReveal();
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

  const handleMeasurement = (enable: boolean): void => {
    if (viewer.models.length <= 0) {
      return;
    }
    setMeasurementEnabled((prevState) => !prevState);
    if (enable) {
      enterMeasurement();
    } else {
      exitMeasurement();
    }
  };

  return (
    <Button
      type="ghost"
      icon="Ruler"
      toggled={measurementEnabled}
      aria-label="Make measurements"
      onClick={() => {
        handleMeasurement(!measurementEnabled);
      }}
    />
  );
};
