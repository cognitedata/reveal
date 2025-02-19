/*!
 * Copyright 2025 Cognite AS
 */

import { type DomainObject } from '../domainObjects/DomainObject';
import { type Class } from '../domainObjectsHelpers/Class';
import { type ThreeView } from './ThreeView';

export type ThreeViewCreator = () => ThreeView;

/**
 * Determines if a Three.js view can be created for the given domain object.
 *
 * @param domainObject - The domain object to check.
 * @returns `true` if a Three.js view can be created, otherwise `false`.
 */
export function canCreateThreeView(domainObject: DomainObject): boolean {
  return ThreeViewFactory.instance.canCreate(domainObject);
}

/**
 * Creates a ThreeView instance for the given domain object.
 *
 * @param domainObject - The domain object for which the ThreeView is to be created.
 * @returns A ThreeView instance if creation is successful, otherwise undefined.
 */
export function createThreeView(domainObject: DomainObject): ThreeView | undefined {
  return ThreeViewFactory.instance.create(domainObject);
}

/**
 * Installs a Three.js view for a specific domain object type.
 *
 * @param domainObjectType - The class of the domain object for which the view is being installed.
 * @param viewType - The class of the view to be installed.
 */
export function installThreeView<View extends ThreeView>(
  domainObjectType: Class<DomainObject>,
  viewType: new () => View
): void {
  ThreeViewFactory.instance.install(domainObjectType, viewType);
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
  ThreeViewFactory.instance.installCreator(domainObjectType, creator);
}

class ThreeViewFactory {
  private readonly _products = new Map<Class<DomainObject>, ThreeViewCreator>();
  private static _instance: ThreeViewFactory | undefined = undefined;

  private constructor() {}

  public static get instance(): ThreeViewFactory {
    if (ThreeViewFactory._instance === undefined) {
      ThreeViewFactory._instance = new ThreeViewFactory();
    }
    return ThreeViewFactory._instance;
  }

  public install<View extends ThreeView>(
    domainObjectType: Class<DomainObject>,
    ViewType: new () => View
  ): void {
    this.installCreator(domainObjectType, () => new ViewType());
  }

  public installCreator(domainObjectType: Class<DomainObject>, creator: ThreeViewCreator): void {
    this._products.set(domainObjectType, creator);
  }

  public canCreate(domainObject: DomainObject): boolean {
    let domainObjectType: Class<DomainObject> | undefined =
      this.getDomainObjectClassOf(domainObject);
    while (domainObjectType !== undefined) {
      if (this._products.has(domainObjectType)) {
        return true;
      }
      domainObjectType = this.getSuperClassOf(domainObjectType);
    }
    return false;
  }

  public create(domainObject: DomainObject): ThreeView | undefined {
    let domainObjectType: Class<DomainObject> | undefined =
      this.getDomainObjectClassOf(domainObject);
    while (domainObjectType !== undefined) {
      const product = this._products.get(domainObjectType);
      if (product !== undefined) {
        return product();
      }
      domainObjectType = this.getSuperClassOf(domainObjectType);
    }
    return undefined;
  }

  private getDomainObjectClassOf(domainObject: DomainObject): Class<DomainObject> {
    return domainObject.constructor as Class<DomainObject>;
  }

  private getSuperClassOf(domainObjectType: Class<DomainObject>): Class<DomainObject> | undefined {
    return Object.getPrototypeOf(domainObjectType.prototype)?.constructor ?? undefined;
  }
}
