/*!
 * Copyright 2024 Cognite AS
 */

import { AnnotationsDomainObject } from '../AnnotationsDomainObject';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { BoxGizmoDomainObject } from '../BoxGizmoDomainObject';
import { CylinderGizmoDomainObject } from '../CylinderGizmoDomainObject';

export function isAnnotationsOrGizmo(domainObject: DomainObject): boolean {
  return domainObject instanceof AnnotationsDomainObject || isGizmo(domainObject);
}

export function isGizmo(domainObject: DomainObject): boolean {
  return (
    domainObject instanceof BoxGizmoDomainObject ||
    domainObject instanceof CylinderGizmoDomainObject
  );
}
