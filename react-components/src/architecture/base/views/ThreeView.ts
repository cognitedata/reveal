import { type DomainObjectChange } from '../domainObjectsHelpers/DomainObjectChange';
import { BaseView } from './BaseView';
import { Changes } from '../domainObjectsHelpers/Changes';
import { type RenderStyle } from '../renderStyles/RenderStyle';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { type DomainObject } from '../domainObjects/DomainObject';
import { type PerspectiveCamera, type Box3 } from 'three';

/**
 * Represents an abstract base class for a Three.js view in the application.
 * Extends the `BaseView` class. It only has the pointer to the renderTarget and a bounding box.
 * Inherit from this class if you want some visualization that do dot require a group object3D as the root object.
 * It can for instance be a view that changes something on another view, dor instance texture on a surface or whatever.
 * I just wanted to make it ready for some corner cases I have seen during a long time as 3D developer.
 */
export abstract class ThreeView<
  DomainObjectType extends DomainObject = DomainObject
> extends BaseView<DomainObjectType> {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _boundingBox: Box3 | undefined = undefined; // Cache of the bounding box of the view
  private _renderTarget: RevealRenderTarget | undefined = undefined;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get hasRenderTarget(): boolean {
    return this._renderTarget !== undefined;
  }

  public get renderTarget(): RevealRenderTarget {
    if (this._renderTarget === undefined) {
      throw Error('The RevealRenderTarget is missing in the view');
    }
    return this._renderTarget;
  }

  protected get style(): RenderStyle | undefined {
    return this.domainObject.getRenderStyle();
  }

  // ==================================================
  // OVERRIDES of BaseView
  // ==================================================

  public override update(change: DomainObjectChange): void {
    super.update(change);
    if (change.isChanged(Changes.geometry, Changes.dragging)) {
      this.invalidateBoundingBox();
      this.invalidateRenderTarget();
    }
  }

  public override clearMemory(): void {
    super.clearMemory();
    this.invalidateBoundingBox();
  }

  public override onShow(): void {
    super.onShow();
    this.invalidateRenderTarget();
  }

  public override onHide(): void {
    super.onHide();
    this.invalidateRenderTarget();
  }

  public override dispose(): void {
    super.dispose();
    this._renderTarget = undefined;
  }

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  /**
   * Calculates the bounding box of the view.
   * Override this function to recalculate the bounding box of the view.
   * @returns The calculated bounding box of the view.
   */
  protected abstract calculateBoundingBox(): Box3;

  /**
   * This method is called before rendering the view.
   * Override this function to perform any necessary operations
   * just before rendering. Have in mind that the Object3D are build at the time this is
   * called, so you can only do adjustment on existing object3D's.
   * @remarks
   * Always call `super.beforeRender(camera)` in the overrides.
   */
  public beforeRender(_camera: PerspectiveCamera): void {}

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public get boundingBox(): Box3 {
    if (this._boundingBox === undefined) {
      this._boundingBox = this.calculateBoundingBox();
    }
    return this._boundingBox;
  }

  protected invalidateBoundingBox(): void {
    this._boundingBox = undefined;
  }

  public attach(domainObject: DomainObjectType, renderTarget: RevealRenderTarget): void {
    super.setDomainObject(domainObject);
    this._renderTarget = renderTarget;
  }

  protected invalidateRenderTarget(): void {
    this.renderTarget.invalidate();
  }
}
