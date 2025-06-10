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
  for (const domainObjectType of getClassesOf(domainObject)) {
    if (_products.has(domainObjectType)) {
      return true;
    }
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
  for (const domainObjectType of getClassesOf(domainObject)) {
    const product = _products.get(domainObjectType);
    if (product !== undefined) {
      return product();
    }
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

export function* getClassesOf(domainObject: DomainObject): Generator<Class<DomainObject>> {
  let classType = getClassOf(domainObject);
  while (true) {
    yield classType;
    const superClassType = getSuperClassOf(classType);
    if (superClassType === undefined) {
      return;
    }
    classType = superClassType;
  }

  function getClassOf(domainObject: DomainObject): Class<DomainObject> {
    return domainObject.constructor as Class<DomainObject>;
  }

  function getSuperClassOf(domainObjectType: Class<DomainObject>): Class<DomainObject> | undefined {
    return Object.getPrototypeOf(domainObjectType.prototype)?.constructor ?? undefined;
  }
}
