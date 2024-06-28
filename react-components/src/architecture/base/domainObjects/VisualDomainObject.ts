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

/**
 * Represents a visual domain object that can be rendered and manipulated in a three-dimensional space.
 * This class extends the `DomainObject` class and provides additional functionality for visualization.
 */

export abstract class VisualDomainObject extends DomainObject {
  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override getVisibleState(renderTarget: RevealRenderTarget): VisibleState {
    if (this.getViewByTarget(renderTarget) !== undefined) {
      return VisibleState.All;
    }
    if (this.canCreateThreeView()) {
      if (this.canBeSetVisibleNow(renderTarget)) {
        return VisibleState.None;
      }
      return VisibleState.CanNotBeVisibleNow;
    }
    return VisibleState.Disabled;
  }

  public override setVisibleInteractive(
    visible: boolean,
    renderTarget: RevealRenderTarget,
    topLevel = true
  ): boolean {
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

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  /**
   * Factory methods to create its own three view for visualization in three.js
   */
  protected abstract createThreeView(): ThreeView | undefined;

  /**
   * Determines whether the visual domain object can create a three view.
   * It may have a state when it can not create a view because of other dependencies
   *
   * @returns A boolean value indicating whether the visual domain object can create a three view.
   */
  protected canCreateThreeView(): boolean {
    return true;
  }

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
      if (!this.canCreateThreeView()) {
        return false;
      }
      view = this.createThreeView();
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
  point: Vector3;
  ray: Ray;
};
