import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { CadDomainObject } from '../cad/CadDomainObject';
import { Image360CollectionDomainObject } from '../Image360Collection/Image360CollectionDomainObject';
import { PointCloudDomainObject } from '../pointCloud/PointCloudDomainObject';

export type RevealDomainObject =
  | CadDomainObject
  | PointCloudDomainObject
  | Image360CollectionDomainObject;

export function isRevealDomainObject(
  domainObject: DomainObject
): domainObject is RevealDomainObject {
  return (
    domainObject instanceof CadDomainObject ||
    domainObject instanceof PointCloudDomainObject ||
    domainObject instanceof Image360CollectionDomainObject
  );
}
