/*!
 * Copyright 2023 Cognite AS
 */

import { useCallback, useMemo } from 'react';
import { MeasurementButton, distancesInFeetAndMeters } from './MeasurementButton';
import { Measurement, MeasurementTool } from '@cognite/reveal/tools';
import { useReveal } from '../..';
import { Vector3 } from 'three';

/**
 * MeasurementButtonWithURlstate - A measurementButton that automatically initializes
 * the tool from URL and updates the URL on change
 */
export const MeasurementButtonWithUrlState = () => {
  const measurementTool = useMeasurementToolWithMeasurementsFromUrl();

  const addMeasurementsToUrl = useAddMeasurementsToUrl();

  return (
    <MeasurementButton
      measurementTool={measurementTool}
      onMeasurementsUpdate={addMeasurementsToUrl}
    />
  );
};

type SerializedMeasurement = number[];

export const useGetMeasurementsFromUrlParam = (): (() => {
  startPoint: Vector3;
  endPoint: Vector3;
}[]) => {
  return useCallback(() => {
    const url = new URL(window.location.toString());
    const serializedMeasurements = url.searchParams.get('measurements');

    if (serializedMeasurements === null) {
      return [];
    }

    const measurements = JSON.parse(serializedMeasurements) as SerializedMeasurement[];

    return measurements.map((measurementValues) => {
      const startPoint = new Vector3().fromArray(measurementValues, 0);
      const endPoint = new Vector3().fromArray(measurementValues, 3);

      return { startPoint, endPoint };
    });
  }, []);
};

export const useAddMeasurementsToUrl = (): ((measurements: Measurement[]) => void) => {
  return useCallback((measurements: Measurement[]) => {
    const url = new URL(window.location.toString());

    if (measurements.length > 0) {
      const serializedMeasurements = measurements.map((measurement) => [
        ...measurement.startPoint.toArray(),
        ...measurement.endPoint.toArray()
      ]);

      const paramString = JSON.stringify(serializedMeasurements);
      url.searchParams.set('measurements', paramString);
    } else {
      url.searchParams.delete('measurements');
    }
    window.history.pushState({}, '', url);
  }, []);
};

const useMeasurementToolWithMeasurementsFromUrl = (): MeasurementTool => {
  const viewer = useReveal();
  const getUrlMeasurements = useGetMeasurementsFromUrlParam();

  return useMemo(() => {
    const measurementTool = new MeasurementTool(viewer, {
      distanceToLabelCallback: (distanceInMeters: number) => {
        return distancesInFeetAndMeters(distanceInMeters);
      }
    });

    const measurements = getUrlMeasurements();
    measurements.forEach((measurement) => {
      measurementTool.addMeasurement(measurement.startPoint, measurement.endPoint);
    });

    measurementTool.visible(false);

    return measurementTool;
  }, [viewer]);
};
