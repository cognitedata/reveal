/*!
 * Copyright 2024 Cognite AS
 */
/* eslint-disable @typescript-eslint/class-literal-property-style */

import { type DomainObjectChange } from '../utilities/misc/DomainObjectChange';
import { BaseView } from './BaseView';
import { Changes } from '../utilities/misc/Changes';
import { type RenderStyle } from '../utilities/misc/RenderStyle';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { type DomainObject } from '../domainObjects/DomainObject';
import { type Box3 } from 'three';

/**
 * Represents an abstract base class for a Three.js view in the application.
 * Extends the `BaseView` class.
 */
export abstract class ThreeView extends BaseView {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _boundingBox: Box3 | undefined = undefined; // Cashe of the bounding box of the view
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
    if (change.isChanged(Changes.geometry)) {
      this.invalidateBoundingBox();
    }
    this.invalidate();
  }

  public override clearMemory(): void {
    super.clearMemory();
    this.invalidateBoundingBox();
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

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public getBoundingBox(target: Box3): Box3 {
    if (this._boundingBox === undefined) {
      this._boundingBox = this.calculateBoundingBox();
    }
    target.copy(this._boundingBox);
    return target;
  }

  protected invalidateBoundingBox(): void {
    this._boundingBox = undefined;
  }

  public attach(domainObject: DomainObject, renderTarget: RevealRenderTarget): void {
    this.domainObject = domainObject;
    this._renderTarget = renderTarget;
  }

  protected invalidate(): void {
    this.renderTarget.invalidate();
  }
}
