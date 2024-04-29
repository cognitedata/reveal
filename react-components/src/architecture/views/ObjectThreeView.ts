/*!
 * Copyright 2024 Cognite AS
 */

import { BoxHelper, Group, type Object3D } from 'three';
import { ThreeView } from './ThreeView';
import { type DomainObjectChange } from '../utilities/misc/DomainObjectChange';
import { Changes } from '../utilities/misc/Changes';
import { Range3 } from '../utilities/geometry/Range3';

/**
 * Represents an abstract class for a Three.js view that renders an Object3D.
 * This class extends the ThreeView class.
 * @remarks
 * You only have to override createObject3D() to create the object to be render.
 */
export abstract class ObjectThreeView extends ThreeView {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  protected _object3D: Object3D | undefined = undefined;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  protected get hasObject3D(): boolean {
    return this._object3D !== undefined;
  }

  protected get object3D(): Object3D | undefined {
    if (this._object3D === undefined) {
      this.makeObject();
    }
    return this._object3D;
  }

  // ==================================================
  // OVERRIDES of BaseView
  // ==================================================

  public initialize(): void {
    super.initialize();
    if (this._object3D === undefined) {
      this.makeObject();
    }
  }

  public override update(change: DomainObjectChange): void {
    super.update(change);
    if (change.isChanged(Changes.geometry)) {
      this.removeObject();
    }
  }

  public override clearMemory(): void {
    super.clearMemory();
    this.removeObject();
  }

  public override beforeRender(): void {
    super.beforeRender();
    if (this._object3D === undefined) {
      this.makeObject();
    }
  }

  public override dispose(): void {
    this.removeObject();
    super.dispose();
  }

  // ==================================================
  // OVERRIDES of ThreeView
  // ==================================================

  public override get isVisible(): boolean {
    return this._object3D?.parent !== null;
  }

  public override calculateBoundingBox(): Range3 {
    if (this.object3D === undefined) {
      return Range3.empty;
    }
    const boundingBox = getBoundingBox(this.object3D);
    if (boundingBox === undefined) {
      return Range3.empty;
    }
    return boundingBox;
  }

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  protected abstract createObject3D(): Object3D | undefined;

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private makeObject(): void {
    if (this._object3D !== undefined) {
      throw Error('Can make the object when it is already made');
    }
    this._object3D = this.createObject3D();
    if (this._object3D === undefined) {
      return;
    }
    const root = this.renderTarget.rootObject3D;
    root.add(this._object3D);
    this.touchBoundingBox();
  }

  private removeObject(): void {
    if (this._object3D === undefined) {
      return;
    }
    const root = this.renderTarget.rootObject3D;
    root.remove(this._object3D);
    this._object3D = undefined;
    // TODO: Do we have to dispose Object3D in some way (matrials?)
  }
}
function getBoundingBox(object: Object3D | undefined): Range3 | undefined {
  if (object === undefined) {
    return undefined;
  }
  if (object instanceof Group) {
    const boundingBox = new Range3();
    for (const child of object.children) {
      const childBoundingBox = getBoundingBox(child);
      if (childBoundingBox !== undefined) {
        boundingBox.addRange(childBoundingBox);
      }
    }
    return boundingBox;
  }
  const helper = new BoxHelper(object);
  helper.geometry.computeBoundingBox();
  const box = helper.geometry.boundingBox;
  if (box === null || box.isEmpty()) {
    return undefined;
  }
  return new Range3(box.min, box.max);
}
