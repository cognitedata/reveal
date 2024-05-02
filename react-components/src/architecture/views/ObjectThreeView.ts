/*!
 * Copyright 2024 Cognite AS
 */
/* eslint-disable @typescript-eslint/class-literal-property-style */

import { Box3, Group, Mesh, type Object3D } from 'three';
import { ThreeView } from './ThreeView';
import { type DomainObjectChange } from '../utilities/misc/DomainObjectChange';
import { Changes } from '../utilities/misc/Changes';
import {
  type CustomObjectIntersectInput,
  type CustomObjectIntersection,
  type ICustomObject
} from '@cognite/reveal';

/**
 * Represents an abstract class for a Three.js view that renders an Object3D.
 * This class extends the ThreeView class.
 * @remarks
 * You only have to override createObject3D() to create the object to be render.
 */
export abstract class ObjectThreeView extends ThreeView implements ICustomObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  protected _object: Object3D | undefined = undefined;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  protected get hasObject3D(): boolean {
    return this._object !== undefined;
  }

  // ==================================================
  // IMPLEMENTATION of ICustomObject
  // ==================================================

  public get object(): Object3D {
    if (this._object === undefined) {
      this.makeObject();
    }
    if (this._object === undefined) {
      throw Error('The object is not created');
    }
    return this._object;
  }

  public get shouldPick(): boolean {
    return true; // To be overridden
  }

  public get shouldPickBoundingBox(): boolean {
    return true; // To be overridden
  }

  public get isPartOfBoundingBox(): boolean {
    return true; // To be overridden
  }

  public intersectIfCloser(
    intersectInput: CustomObjectIntersectInput,
    closestDistance: number | undefined
  ): undefined | CustomObjectIntersection {
    const solid = this.object.getObjectByName('Solid') as Mesh;
    solid.updateMatrixWorld();
    solid.updateMatrixWorld(true);

    console.log('intersectInput.raycaster', intersectInput.raycaster);
    const intersection = intersectInput.raycaster.intersectObject(solid, true);
    if (intersection.length === 0) {
      console.log('intersectIfCloser A', this.domainObject.name);
      return undefined;
    }
    const { point, distance } = intersection[0];
    if (closestDistance !== undefined && closestDistance < distance) {
      console.log('intersectIfCloser B', this.domainObject.name);
      return undefined;
    }
    if (!intersectInput.isVisible(point)) {
      console.log('intersectIfCloser C', this.domainObject.name);
      return undefined;
    }
    console.log('intersectIfCloser found', this.domainObject.name);
    const customObjectIntersection: CustomObjectIntersection = {
      type: 'customObject',
      customObject: this,
      point,
      distanceToCamera: distance,
      userData: intersection[0]
    };
    if (this.shouldPickBoundingBox) {
      const boundingBox = this.getBoundingBox(new Box3());
      if (!boundingBox.isEmpty()) {
        console.log('intersectIfCloser boundingBox', boundingBox);
        customObjectIntersection.boundingBox = boundingBox;
      }
    }
    return customObjectIntersection;
  }

  // ==================================================
  // OVERRIDES of BaseView
  // ==================================================

  public initialize(): void {
    super.initialize();
    if (this._object === undefined) {
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
    if (this._object === undefined) {
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

  public override calculateBoundingBox(): Box3 {
    if (this.object === undefined) {
      return new Box3().makeEmpty();
    }
    const boundingBox = new Box3();
    boundingBox.setFromObject(this.object);
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
    if (this._object !== undefined) {
      throw Error('Can make the object when it is already made');
    }
    this._object = this.createObject3D();
    if (this._object === undefined) {
      return;
    }
    const { viewer } = this.renderTarget;
    viewer.addCustomObject(this);
  }

  private removeObject(): void {
    if (this._object === undefined) {
      return;
    }
    const { viewer } = this.renderTarget;
    viewer.removeCustomObject(this);
    disposeMaterials(this._object);
    this._object = undefined;
    // TODO: Do we have to dispose Object3D in some way (matrials?)
  }
}

function disposeMaterials(object: Object3D): void {
  if (object === undefined) {
    return undefined;
  }
  if (object instanceof Group) {
    for (const child of object.children) {
      disposeMaterials(child);
    }
  }
  if (object instanceof Mesh && object.material !== undefined) {
    if (object.material.map !== undefined) {
      object.material.map.dispose();
    }
    if (object.material.texture !== undefined) {
      object.material.texture.dispose();
    }
    object.material.dispose();
  }
}
