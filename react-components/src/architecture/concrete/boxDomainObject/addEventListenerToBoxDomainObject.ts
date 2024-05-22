/*!
 * Copyright 2024 Cognite AS
 */

import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { MeasureBoxDomainObject } from './MeasureBoxDomainObject';

export type MeasurementObjectInfo = {
  domainObject: MeasureBoxDomainObject;
};

function measurementToMeasurementInfo(box: MeasureBoxDomainObject): MeasurementObjectInfo {
  return {
    domainObject: box
  };
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function addEventListenerToMeasureBoxDomainObject(
  box: MeasureBoxDomainObject,
  setter: ((box: MeasurementObjectInfo | undefined) => void) | undefined
) {
  box.addEventListener((measurement, change) => {
    if (!(measurement instanceof MeasureBoxDomainObject)) {
      return;
    }

    if (change.isChanged(Changes.deleted)) {
      setter?.(undefined);
    }

    if (!change.isChanged(Changes.focus, Changes.geometry)) {
      return;
    }

    const measurementInfo = measurementToMeasurementInfo(measurement);

    console.log('Setting box info', measurementInfo, ' with setter', setter);
    setter?.(measurementInfo);
  });
}
