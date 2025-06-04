import { Box3, Group, Mesh, type Object3D } from 'three';
import { ThreeView } from './ThreeView';
import { type DomainObjectChange } from '../domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../domainObjectsHelpers/Changes';
import {
  type CustomObjectIntersectInput,
  type CustomObjectIntersection,
  type ICustomObject
} from '@cognite/reveal';
import { type DomainObjectIntersection } from '../domainObjectsHelpers/DomainObjectIntersection';
import { VisualDomainObject } from '../domainObjects/VisualDomainObject';
import { type DomainObject } from '../domainObjects/DomainObject';

/**
 * Represents an abstract class for a Three.js view that renders an Object3D.
 * This class extends the ThreeView class. It created a group object3D and adds children to it.
 * @remarks
 * You only have to override addChildren() to create the object3D to be added to the group.
 * Other methods you may override is:
 * - intersectIfCloser() to determine the exact intersection point.
 * - calculateBoundingBox() to calculate the bounding box if you don not relay on three.js.
 */

export abstract class GroupThreeView<DomainObjectType extends DomainObject = DomainObject>
  extends ThreeView<DomainObjectType>
  implements ICustomObject
{
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  protected readonly _group: Group = new Group();
  private _inNeedsUpdate = false; // True if inside needsUpdate. This is to avoid infinite recursion.

  protected get isEmpty(): boolean {
    return this._group.children.length === 0;
  }

  // ==================================================
  // IMPLEMENTATION of ICustomObject
  // some of the methods are virtual and can be overridden,
  // see each method.
  // ==================================================

  public get object(): Object3D {
    if (this.needsUpdate) {
      this.removeChildren();
    }
    if (this.isEmpty) {
      this.makeChildren();
    }
    return this._group;
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

  public get useDepthTest(): boolean {
    return true; // To be overridden
  }

  public getBoundingBox(target: Box3): Box3 {
    target.copy(this.boundingBox);
    return target;
  }

  public intersectIfCloser(
    intersectInput: CustomObjectIntersectInput,
    closestDistance: number | undefined
  ): undefined | CustomObjectIntersection {
    return this.intersectObjectIfCloser(this.object, intersectInput, closestDistance);
  }

  // ==================================================
  // OVERRIDES of BaseView
  // ==================================================

  public override initialize(): void {
    super.initialize();
    if (this.isEmpty) {
      this.makeChildren();
    }
    const { viewer } = this.renderTarget;
    viewer.addCustomObject(this);
  }

  public override update(change: DomainObjectChange): void {
    super.update(change);
    if (change.isChanged(Changes.geometry, Changes.dragging)) {
      this.removeChildren();
      this.invalidateRenderTarget();
    }
  }

  public override clearMemory(): void {
    super.clearMemory();
    this.removeChildren();
  }

  public override dispose(): void {
    this.removeChildren();
    const { viewer } = this.renderTarget;
    viewer.removeCustomObject(this);
    super.dispose();
  }

  // ==================================================
  // OVERRIDES of ThreeView
  // ==================================================

  /**
   * Calculates the bounding box of the object.
   * Overrides this if you want to calculate the bounding box in a
   * different way that three.js does it. For instance if you don't
   * want to include text labels in the bounding box.
   *
   * @returns The calculated bounding box.
   */
  protected override calculateBoundingBox(): Box3 {
    if (this.object === undefined) {
      return new Box3().makeEmpty();
    }
    const boundingBox = new Box3();
    boundingBox.setFromObject(this.object, true);
    return boundingBox;
  }

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  /**
   * Add the Object3 children to the view. Use the addChild() method to add the children.
   * This method should always be overridden in derived classes.
   */
  protected abstract addChildren(): void;

  /**
   * Determines whether the view needs to be updated just before rendering.
   * Typically needed to be implemented if the update function is not enough and
   * the view depend on other factors as the model bounding box or the camera position.
   * This method can be overridden in derived classes.
   *
   * When it returns true, the view will be rebuild by addChildren().
   * @returns A boolean value indicating whether the view needs to be updated.
   */
  protected needsUpdateCore(): boolean {
    return false;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  protected get needsUpdate(): boolean {
    if (this._inNeedsUpdate) {
      return false;
    }
    this._inNeedsUpdate = true;
    const result = this.needsUpdateCore();
    this._inNeedsUpdate = false;
    return result;
  }

  private makeChildren(): void {
    if (!this.isEmpty) {
      throw Error('Can make the object when it is already made');
    }
    this.addChildren();
  }

  protected removeChildren(): void {
    if (this.isEmpty) {
      return;
    }
    disposeMaterials(this._group);
    this._group.remove(...this._group.children);
  }

  protected addChild(child: Object3D | undefined): void {
    if (child === undefined) {
      return;
    }
    this._group.add(child);
  }

  protected removeChild(child: Object3D | undefined): void {
    if (child === undefined) {
      return;
    }
    disposeMaterials(child);
    this._group.remove(child);
  }

  protected intersectObjectIfCloser(
    object: Object3D,
    intersectInput: CustomObjectIntersectInput,
    closestDistance: number | undefined
  ): undefined | CustomObjectIntersection {
    const intersection = intersectInput.raycaster.intersectObject(object, true);
    if (intersection === undefined || intersection.length === 0) {
      return undefined;
    }
    const { point, distance } = intersection[0];
    if (closestDistance !== undefined && closestDistance < distance) {
      return undefined;
    }
    const { domainObject } = this;

    if (domainObject instanceof VisualDomainObject) {
      if (domainObject.useClippingInIntersection && !intersectInput.isVisible(point)) {
        return undefined;
      }
    } else {
      if (!intersectInput.isVisible(point)) {
        return undefined;
      }
    }
    const customObjectIntersection: DomainObjectIntersection = {
      type: 'customObject',
      point,
      distanceToCamera: distance,
      userData: intersection[0],
      customObject: this,
      domainObject
    };
    if (this.shouldPickBoundingBox) {
      const boundingBox = this.boundingBox;
      if (!boundingBox.isEmpty()) {
        customObjectIntersection.boundingBox = this.boundingBox;
      }
    }
    return customObjectIntersection;
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
  if (!(object instanceof Mesh)) {
    return;
  }
  const material = object.material;
  if (material !== null && material !== undefined) {
    const texture = material.texture;
    if (texture !== undefined && texture !== null) {
      texture.dispose();
    }
    material.dispose();
  }
}
