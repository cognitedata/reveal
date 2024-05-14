/*!
 * Copyright 2024 Cognite AS
 */

import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { ThreeView } from '../views/ThreeView';
import { VisibleState } from '../domainObjectsHelpers/VisibleState';
import { DomainObject } from './DomainObject';

export abstract class VisualDomainObject extends DomainObject {
  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override getVisibleState(target: RevealRenderTarget): VisibleState {
    if (this.isVisible(target)) {
      return VisibleState.All;
    }
    if (this.canCreateThreeView()) {
      if (this.canBeChecked(target)) {
        return VisibleState.None;
      }
      return VisibleState.CanNotBeChecked;
    }
    return VisibleState.Disabled;
  }

  public override setVisibleInteractive(
    visible: boolean,
    target: RevealRenderTarget,
    topLevel = true
  ): boolean {
    if (visible && !this.canBeChecked(target)) {
      return false;
    }
    if (!this.setVisible(visible, target)) {
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

  protected abstract createThreeView(): ThreeView | undefined;

  protected canCreateThreeView(): boolean {
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public getViewByTarget(target: RevealRenderTarget): ThreeView | undefined {
    for (const view of this.getViewsByType(ThreeView)) {
      if (view.renderTarget === target) {
        return view;
      }
    }
  }

  public isVisible(target: RevealRenderTarget): boolean {
    return this.getViewByTarget(target) !== undefined;
  }

  /**
   * Sets the visibility of the visual domain object for a specific target.
   *
   * @param visible - A boolean indicating whether the visual domain object should be visible or not.
   * @param target - The target RevealRenderTarget where the visual domain object will be attached.
   * @returns A boolean indicating whether the state has changed.
   */
  public setVisible(visible: boolean, target: RevealRenderTarget): boolean {
    let view = this.getViewByTarget(target);
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
      this.addView(view);
      view.attach(this, target);
      view.initialize();
      view.onShow();
    } else {
      if (view === undefined) {
        return false;
      }
      this.removeView(view);
    }
    return true; // State has changed
  }
}
