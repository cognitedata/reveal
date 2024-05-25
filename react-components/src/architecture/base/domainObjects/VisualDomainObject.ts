/*!
 * Copyright 2024 Cognite AS
 */

import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { ThreeView } from '../views/ThreeView';
import { VisibleState } from '../domainObjectsHelpers/VisibleState';
import { DomainObject } from './DomainObject';

/**
 * Represents a visual domain object that can be rendered and manipulated in a three-dimensional space.
 * This class extends the `DomainObject` class and provides additional functionality for visualization.
 */
export abstract class VisualDomainObject extends DomainObject {
  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override getVisibleState(renderTarget: RevealRenderTarget): VisibleState {
    if (this.isVisible(renderTarget)) {
      return VisibleState.All;
    }
    if (this.canCreateThreeView()) {
      if (this.canBeChecked(renderTarget)) {
        return VisibleState.None;
      }
      return VisibleState.CanNotBeChecked;
    }
    return VisibleState.Disabled;
  }

  public override setVisibleInteractive(
    visible: boolean,
    renderTarget: RevealRenderTarget,
    topLevel = true
  ): boolean {
    if (visible && !this.canBeChecked(renderTarget)) {
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
   * It may have a state when it can not create a view bacause of other dependencies
   *
   * @returns A boolean value indicating whether the visual domain object can create a three view.
   */
  protected canCreateThreeView(): boolean {
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
   * Checks if the visual domain object is visible in the specified render target.
   * @param renderTarget - The render target to check visibility in.
   * @returns `true` if the visual domain object is visible in the target, `false` otherwise.
   */
  public isVisible(renderTarget: RevealRenderTarget): boolean {
    return this.getViewByTarget(renderTarget) !== undefined;
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
