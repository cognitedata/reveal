/*!
 * Copyright 2024 Cognite AS
 */

import { type Plane } from 'three';
import { SliceDomainObject } from '../SliceDomainObject';
import { type RootDomainObject } from '../../../base/domainObjects/RootDomainObject';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';

export function setClippingPlanes(root: RootDomainObject): boolean {
  const planes: Plane[] = [];
  for (const sliceDomainObject of root.getDescendantsByType(SliceDomainObject)) {
    const plane = sliceDomainObject.plane.clone();
    if (sliceDomainObject.focusType === FocusType.Pending) {
      continue; // Do not use any pending objects in clipping
    }
    planes.push(plane);
  }
  root.renderTarget.setGlobalClipping(planes);
  return true;
}
