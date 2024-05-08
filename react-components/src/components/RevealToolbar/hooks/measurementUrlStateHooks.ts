/*!
 * Copyright 2023 Cognite AS
 */

import { useCallback, useMemo } from 'react';
import { distancesInFeetAndMeters } from '../MeasurementButton';
import { type Measurement, MeasurementTool } from '@cognite/reveal/tools';
import { Vector3 } from 'three';
import { useReveal } from '../../RevealCanvas/ViewerContext';

type SerializedMeasurement = number[];

const useGetMeasurementsFromUrlParam = (): (() => Array<{
  startPoint: Vector3;
  endPoint: Vector3;
}>) => {
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

export const useInitializedMeasurementTool = (initializeFromUrl: boolean): MeasurementTool => {
  const viewer = useReveal();
  const getUrlMeasurements = useGetMeasurementsFromUrlParam();

  return useMemo(() => {
    const measurementTool = new MeasurementTool(viewer, {
      distanceToLabelCallback: (distanceInMeters: number) => {
        return distancesInFeetAndMeters(distanceInMeters);
      }
    });

    if (initializeFromUrl) {
      const measurements = getUrlMeasurements();
      measurements.forEach((measurement) => {
        measurementTool.addMeasurement(measurement.startPoint, measurement.endPoint);
      });
    }

    measurementTool.visible(false);

    return measurementTool;
  }, [viewer]);
};

export const useAddMeasurementsToUrl = (
  storeInUrl: boolean
): ((measurements: Measurement[]) => void) => {
  return useCallback((measurements: Measurement[]) => {
    if (!storeInUrl) {
      return;
    }

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
