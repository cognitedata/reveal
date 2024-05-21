import { DomainObject } from '../../base/domainObjects/DomainObject';
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
