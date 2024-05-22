/*!
 * Copyright 2024 Cognite AS
 */

import { DomainObject } from '../../base/domainObjects/DomainObject';
import { Changes } from '../../base/domainObjectsHelpers/Changes';

export type DomainObjectInfo = {
  domainObject: DomainObject;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function addEventListenerToDomainObject(
  domainObject: DomainObject,
  setter: ((info: DomainObjectInfo | undefined) => void) | undefined
) {
  domainObject.addEventListener((domainObject, change) => {
    if (!(domainObject instanceof DomainObject)) {
      return;
    }

    if (change.isChanged(Changes.deleted)) {
      setter?.(undefined);
    }

    if (!change.isChanged(Changes.focus, Changes.geometry)) {
      return;
    }

    const domainObjectInfo = {
      domainObject
    };
    console.log('domainObjectInfo', domainObjectInfo, ' with setter', setter);
    setter?.(domainObjectInfo);
  });
}
