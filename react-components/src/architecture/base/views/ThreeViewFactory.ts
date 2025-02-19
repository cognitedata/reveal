/*!
 * Copyright 2025 Cognite AS
 */

import { type DomainObject } from '../domainObjects/DomainObject';
import { type Class } from '../domainObjectsHelpers/Class';
import { type ThreeView } from './ThreeView';

type ViewCreator = () => ThreeView;

export function canCreateThreeView(domainObject: DomainObject): boolean {
  return ThreeViewFactory.instance.canCreate(domainObject);
}

export function createThreeView(domainObject: DomainObject): ThreeView | undefined {
  return ThreeViewFactory.instance.create(domainObject);
}

export function installThreeView<View extends ThreeView>(
  domainObjectType: Class<DomainObject>,
  viewType: new () => View
): void {
  ThreeViewFactory.instance.install(domainObjectType, viewType);
}

class ThreeViewFactory {
  private readonly _products = new Map<Class<DomainObject>, ViewCreator>();
  private static _instance: ThreeViewFactory | undefined = undefined;

  private constructor() {}

  public static get instance(): ThreeViewFactory {
    if (ThreeViewFactory._instance === undefined) {
      ThreeViewFactory._instance = new ThreeViewFactory();
    }
    return ThreeViewFactory._instance;
  }

  public install<View extends ThreeView, DomainObj extends DomainObject>(
    domainObjectType: Class<DomainObj>,
    ViewType: new () => View
  ): void {
    const creator = (): ThreeView => new ViewType();
    this._products.set(domainObjectType, creator);
  }

  public canCreate(domainObject: DomainObject): boolean {
    let domainObjectType: Class<DomainObject> | undefined = this.getDomainObjectType(domainObject);
    while (domainObjectType !== undefined) {
      if (this._products.has(domainObjectType)) {
        return true;
      }
      domainObjectType = this.getSuperClass(domainObjectType);
    }
    return false;
  }

  public create(domainObject: DomainObject): ThreeView | undefined {
    let domainObjectType: Class<DomainObject> | undefined = this.getDomainObjectType(domainObject);
    while (domainObjectType !== undefined) {
      const product = this._products.get(domainObjectType);
      if (product !== undefined) {
        return product();
      }
      domainObjectType = this.getSuperClass(domainObjectType);
    }
    return undefined;
  }

  private getDomainObjectType(domainObject: DomainObject): Class<DomainObject> {
    return domainObject.constructor as Class<DomainObject>;
  }

  private getSuperClass(domainObjectType: Class<DomainObject>): Class<DomainObject> | undefined {
    return Object.getPrototypeOf(domainObjectType.prototype)?.constructor ?? undefined;
  }
}
