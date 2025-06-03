/*!
 * Copyright 2024 Cognite AS
 */

import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { ThreeView } from '../views/ThreeView';
import { VisibleState } from '../domainObjectsHelpers/VisibleState';
import { DomainObject } from './DomainObject';
import { type DomainObjectIntersection } from '../domainObjectsHelpers/DomainObjectIntersection';
import { type BaseDragger } from '../domainObjectsHelpers/BaseDragger';
import { type Vector3, type Ray } from 'three';
import { FocusType } from '../domainObjectsHelpers/FocusType';
import { Changes } from '../domainObjectsHelpers/Changes';
import { getRenderTarget } from './getRoot';
import { canCreateThreeView, createThreeView } from '../views/ThreeViewFactory';

/**
 * Represents a visual domain object that can be rendered and manipulated in a three-dimensional space.
 * This class extends the `DomainObject` class and provides additional functionality for visualization.
 */

export abstract class VisualDomainObject extends DomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  // For focus when edit in 3D
  public focusType: FocusType = FocusType.None;

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override getVisibleState(renderTarget?: RevealRenderTarget): VisibleState {
    // If renderTarget is not provided, use the renderTarget of the rootDomainObject
    if (renderTarget === undefined) {
      renderTarget = getRenderTarget(this);
      if (renderTarget === undefined) {
        return VisibleState.Disabled;
      }
    }
    if (this.getViewByTarget(renderTarget) !== undefined) {
      return VisibleState.All;
    }
    if (canCreateThreeView(this)) {
      if (this.canBeSetVisibleNow(renderTarget)) {
        return VisibleState.None;
      }
      return VisibleState.CanNotBeVisibleNow;
    }
    return VisibleState.Disabled;
  }

  public override setVisibleInteractive(
    visible: boolean,
    renderTarget: RevealRenderTarget | undefined = undefined,
    topLevel = true
  ): boolean {
    if (renderTarget === undefined) {
      renderTarget = getRenderTarget(this);
      if (renderTarget === undefined) {
        return false;
      }
    }
    if (visible && !this.canBeSetVisibleNow(renderTarget)) {
      return false;
    }
    if (!this.setVisible(visible, renderTarget)) {
      return false;
    }
    if (topLevel) {
      this.notifyVisibleStateChange();
    }
    return true;
  }

  public override get isLegal(): boolean {
    return this.focusType !== FocusType.Pending;
  }

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  /**
   * Factory method to create a dragger to interpret the mouse dragging operation
   * This function is used in BaseEditTool
   *
   * @returns The dragger
   */
  public createDragger(_props: CreateDraggerProps): BaseDragger | undefined {
    return undefined;
  }

  public get useClippingInIntersection(): boolean {
    return true;
  }

  public getEditToolCursor(
    _renderTarget: RevealRenderTarget,
    _point?: Vector3
  ): string | undefined {
    return undefined;
  }

  public setFocusInteractive(focusType: FocusType): boolean {
    if (this.focusType === focusType) {
      return false;
    }
    const changedFromPending =
      this.focusType === FocusType.Pending && focusType !== FocusType.Pending;

    this.focusType = focusType;
    this.notify(Changes.focus);
    if (changedFromPending) {
      this.notify(Changes.geometry);
    }
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public getViewByTarget(renderTarget: RevealRenderTarget): ThreeView | undefined {
    for (const view of this.views.getByType(ThreeView)) {
      if (view.renderTarget === renderTarget) {
        return view;
      }
    }
  }

  /**
   * Sets the visibility of the visual domain object for a specific target.
   * @param visible - A boolean indicating whether the visual domain object should be visible or not.
   * @param target - The target RevealRenderTarget where the visual domain object will be attached.
   * @returns A boolean indicating whether the state has changed.
   */
  public setVisible(visible: boolean, renderTarget: RevealRenderTarget): boolean {
    let view = this.getViewByTarget(renderTarget);
    if (visible) {
      if (view !== undefined) {
        return false;
      }
      view = createThreeView(this);
      if (view === undefined) {
        return false;
      }
      this.views.addView(view);
      view.attach(this, renderTarget);
      view.initialize();
      view.onShow();
    } else {
      if (view === undefined) {
        return false;
      }
      this.views.removeView(view);
    }
    return true; // State has changed
  }
}

export type CreateDraggerProps = {
  intersection: DomainObjectIntersection;
  point: Vector3; // In CDF coordinates
  ray: Ray; // In CDF coordinates
};
