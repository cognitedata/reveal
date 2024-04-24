/*!
 * Copyright 2024 Cognite AS
 */

import { type DomainObjectChange } from '../utilities/misc/DomainObjectChange';
import { BaseView } from './BaseView';
import { Changes } from '../utilities/misc/Changes';
import { type RenderStyle } from '../utilities/misc/RenderStyle';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { type DomainObject } from '../domainObjects/DomainObject';
import { Range3 } from '../utilities/geometry/Range3';

export abstract class ThreeView extends BaseView {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _boundingBox: Range3 | undefined = undefined;
  private _target: RevealRenderTarget | undefined = undefined;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get hasRenderTarget(): boolean {
    return this._target !== undefined;
  }

  public get renderTarget(): RevealRenderTarget {
    if (this._target === undefined) {
      throw Error('The RevealRenderTarget is missing in the view');
    }
    return this._target;
  }

  protected get style(): RenderStyle | undefined {
    return this.domainObject.getRenderStyle();
  }

  // ==================================================
  // OVERRIDES of BaseView
  // ==================================================

  public override update(change: DomainObjectChange): void {
    super.update(change);
    if (change.isChanged(Changes.geometry)) {
      this.touchBoundingBox();
    }
    this.invalidate();
  }

  public override clearMemory(): void {
    super.clearMemory();
    this.touchBoundingBox();
  }

  public override onShow(): void {
    super.onShow();
    this.invalidate();
  }

  public override onHide(): void {
    super.onHide();
    this.invalidate();
  }

  public override dispose(): void {
    super.dispose();
    this._target = undefined;
  }

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  public abstract get isVisible(): boolean;

  /**
   * Calculates the bounding box of the view.
   * Override this function to recalculate the bounding box of the view.
   * @returns The calculated bounding box of the view.
   */
  protected calculateBoundingBox(): Range3 {
    return Range3.empty;
  }

  public shouldPick(): boolean {
    return true; // To be overridden
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public get boundingBox(): Range3 | undefined {
    if (this._boundingBox === undefined) {
      this._boundingBox = this.calculateBoundingBox();
    }
    return this._boundingBox;
  }

  protected touchBoundingBox(): void {
    this._boundingBox = undefined;
  }

  public attach(domainObject: DomainObject, target: RevealRenderTarget): void {
    this.domainObject = domainObject;
    this._target = target;
  }

  protected invalidate(): void {
    this.renderTarget.invalidate();
  }
}
