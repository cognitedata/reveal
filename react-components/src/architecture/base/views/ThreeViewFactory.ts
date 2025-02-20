/*!
 * Copyright 2025 Cognite AS
 */

import { type DomainObject } from '../domainObjects/DomainObject';
import { type Class } from '../domainObjectsHelpers/Class';
import { type ThreeView } from './ThreeView';

type ThreeViewCreator = () => ThreeView;

/**
 * Determines if a Three.js view can be created for the given domain object.
 *
 * @param domainObject - The domain object to check.
 * @returns `true` if a Three.js view can be created, otherwise `false`.
 */
export function canCreateThreeView(domainObject: DomainObject): boolean {
  let domainObjectType: Class<DomainObject> | undefined = getClassOf(domainObject);
  while (domainObjectType !== undefined) {
    if (_products.has(domainObjectType)) {
      return true;
    }
    domainObjectType = getSuperClassOf(domainObjectType);
  }
  return false;
}

/**
 * Creates a ThreeView instance for the given domain object.
 *
 * @param domainObject - The domain object for which the ThreeView is to be created.
 * @returns A ThreeView instance if creation is successful, otherwise undefined.
 */
export function createThreeView(domainObject: DomainObject): ThreeView | undefined {
  let domainObjectType: Class<DomainObject> | undefined = getClassOf(domainObject);
  while (domainObjectType !== undefined) {
    const product = _products.get(domainObjectType);
    if (product !== undefined) {
      return product();
    }
    domainObjectType = getSuperClassOf(domainObjectType);
  }
  return undefined;
}

/**
 * Installs a Three.js view for a specific domain object type.
 *
 * @param domainObjectType - The class of the domain object for which the view is being installed.
 * @param viewType - The class of the view to be installed.
 */
export function installThreeView<View extends ThreeView>(
  domainObjectType: Class<DomainObject>,
  ViewType: new () => View
): void {
  installThreeViewCreator(domainObjectType, () => new ViewType());
}

/**
 * Installs a Three.js view creator for a specific domain object type.
 *
 * @param domainObjectType - The class of the domain object for which the view creator is being installed.
 * @param creator - The view creator to be installed.
 */
export function installThreeViewCreator(
  domainObjectType: Class<DomainObject>,
  creator: ThreeViewCreator
): void {
  _products.set(domainObjectType, creator);
}

const _products = new Map<Class<DomainObject>, ThreeViewCreator>();

function getClassOf(domainObject: DomainObject): Class<DomainObject> {
  return domainObject.constructor as Class<DomainObject>;
}

function getSuperClassOf(domainObjectType: Class<DomainObject>): Class<DomainObject> | undefined {
  return Object.getPrototypeOf(domainObjectType.prototype)?.constructor ?? undefined;
}
