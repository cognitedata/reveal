/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from './RenderTargetCommand';
import { type TranslateDelegate } from '../utilities/TranslateInput';
import { type Color } from 'three';
import { type BaseCommand } from './BaseCommand';
import { CommandsUpdater } from '../reactUpdaters/CommandsUpdater';
import { type IconName } from '../utilities/IconName';

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

  public override get icon(): IconName {
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
    return this._children.every((child) => child.isChecked);
  }

  /**
   * Checks if some the children of the current instance are checked.
   * Override this method to optimize the logic.
   * @returns A boolean value indicating whether some the children are checked.
   */
  public get isSomeChecked(): boolean {
    if (this._children === undefined || this._children.length === 0) {
      return false;
    }
    return this._children.some((child) => child.isChecked);
  }

  /**
   * Toggles the checked state of all child filter items.
   * Override this method to optimize the logic.
   * If there are no child items, this method does nothing.
   * @returns A boolean value indicating whether anything is changed
   */
  protected toggleAllCheckedCore(): boolean {
    if (this._children === undefined || this._children.length === 0) {
      return false;
    }
    const isAllChecked = this.isAllChecked;
    for (const child of this._children) {
      child.setChecked(!isAllChecked);
    }
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public getSelectedLabel(translate: TranslateDelegate): string {
    if (this._children === undefined) {
      return BaseFilterCommand.getNoneString(translate);
    }
    const selected = this._children.filter((child) => child.isChecked);
    const counter = selected.length;
    if (counter === 0) {
      return BaseFilterCommand.getNoneString(translate);
    }
    if (counter === this._children.length) {
      return BaseFilterCommand.getAllString(translate);
    }
    if (counter === 1) {
      return selected[0].getLabel(translate);
    }
    return counter.toString() + ' ' + BaseFilterCommand.getSelectedString(translate);
  }

  public toggleAllChecked(): void {
    if (this.toggleAllCheckedCore()) {
      CommandsUpdater.update(this._renderTarget);
    }
  }

  // ==================================================
  // STATIC METHODS
  // ==================================================

  public static getAllString(translate: TranslateDelegate): string {
    return translate({ key: 'ALL' });
  }

  private static getNoneString(translate: TranslateDelegate): string {
    return translate({ key: 'NONE' });
  }

  private static getSelectedString(translate: TranslateDelegate): string {
    return translate({ key: 'SELECTED' });
  }
}

export abstract class BaseFilterItemCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override invokeCore(): boolean {
    // Toggle the checked state, you do not need to override this method
    // as long as setCheckedCore and isChecked are overridden
    return this.setCheckedCore(!this.isChecked);
  }

  // ==================================================
  // VIRTUAL METHODS (To be overridden)
  // ==================================================

  public get color(): Color | undefined {
    return undefined;
  }

  protected abstract setCheckedCore(value: boolean): boolean;

  public setChecked(value: boolean): void {
    if (this.setCheckedCore(value)) {
      CommandsUpdater.update(this._renderTarget);
    }
  }
}
