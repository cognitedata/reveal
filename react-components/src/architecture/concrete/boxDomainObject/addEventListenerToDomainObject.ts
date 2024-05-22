/*!
 * Copyright 2024 Cognite AS
 */

import { DomainObject } from '../../base/domainObjects/DomainObject';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type SetDomainObjectInfoDelegate } from './MeasurementTool';

export type DomainObjectInfo = {
  domainObject: DomainObject;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function addEventListenerToDomainObject(
  domainObject: DomainObject,
  setter: SetDomainObjectInfoDelegate | undefined
) {
  domainObject.addEventListener((domainObject, change) => {
    if (!(domainObject instanceof DomainObject)) {
      return;
    }

    if (change.isChanged(Changes.deleted)) {
      setter?.(undefined);
    }

    if (change.isChanged(Changes.selected, Changes.geometry)) {
      const domainObjectInfo = { domainObject };
      setter?.(domainObjectInfo);
    }
  });
}
