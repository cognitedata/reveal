/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from './RenderTargetCommand';
import { type TranslateDelegate } from '../utilities/TranslateKey';
import { type Color } from 'three';
import { type BaseCommand } from './BaseCommand';

export abstract class BaseFilterCommand extends RenderTargetCommand {
  // ==================================================
  // INSTANCE FIELDS/PROPERTIES
  // ==================================================

  protected _children: BaseFilterItemCommand[] | undefined = undefined;

  public get children(): BaseFilterItemCommand[] | undefined {
    return this._children;
  }

  public get hasChildren(): boolean {
    return this._children !== undefined && this._children.length > 0;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get icon(): string {
    return 'Filter';
  }

  protected override *getChildren(): Generator<BaseCommand> {
    if (this._children === undefined) {
      return;
    }
    for (const child of this._children) {
      yield child;
    }
  }

  // ==================================================
  // VIRTUAL METHODS (To be overridden)
  // ==================================================

  public initializeChildrenIfNeeded(): void {
    if (this._children !== undefined) {
      return;
    }
    this._children = this.createChildren();
    this.attachChildren();
  }

  protected abstract createChildren(): BaseFilterItemCommand[];

  /**
   * Checks if all the children of the current instance are checked.
   * Override this method to optimize the logic.
   * @returns A boolean value indicating whether all the children are checked.
   */
  public get isAllChecked(): boolean {
    if (this._children === undefined || this._children.length === 0) {
      return false;
    }
    for (const child of this._children) {
      if (!child.isChecked) {
        return false;
      }
    }
    return true;
  }

  /**
   * Toggles the checked state of all child filter items.
   * Override this method to optimize the logic.
   * If there are no child items, this method does nothing.
   */
  public toggleAllChecked(): void {
    if (this._children === undefined || this._children.length === 0) {
      return;
    }
    const isAllChecked = this.isAllChecked;
    for (const child of this._children) {
      child.setChecked(!isAllChecked);
    }
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public getSelectedLabel(translate: TranslateDelegate): string {
    if (this._children === undefined) {
      return getNoneLabel(translate);
    }
    const selected = this._children.filter((child) => child.isChecked);
    const counter = selected.length;
    if (counter === 0) {
      return getNoneLabel(translate);
    }
    if (counter === this._children.length) {
      return getAllLabel(translate);
    }
    if (counter === 1) {
      return selected[0].getLabel(translate);
    }
    return counter.toString() + ' ' + getSelectedLabel(translate);
  }
}

export abstract class BaseFilterItemCommand extends RenderTargetCommand {
  public abstract get color(): Color | undefined;
  public abstract setChecked(value: boolean): void;
}

// ==================================================
// PRIVATE FUNCTIONS
// ==================================================

function getAllLabel(translate: TranslateDelegate): string {
  return translate('ALL', 'All');
}

function getNoneLabel(translate: TranslateDelegate): string {
  return translate('NONE', 'None');
}

function getSelectedLabel(translate: TranslateDelegate): string {
  return translate('SELECTED', 'Selected');
}
