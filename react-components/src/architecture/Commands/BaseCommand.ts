/*!
 * Copyright 2024 Cognite AS
 */
/* eslint-disable @typescript-eslint/class-literal-property-style */

import { isEmpty } from 'lodash';
import { clear, remove } from '../utilities/extensions/arrayExtensions';

type UpdateToolDelegate = () => void;

export abstract class BaseCommand {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _listeners: UpdateToolDelegate[] = [];

  // ==================================================
  // VIRTUAL METHODS (To be overriden)
  // =================================================

  public get name(): string {
    return '';
  }

  public get shortCutKey(): string | undefined {
    return undefined;
  }

  public get tooltip(): string {
    return '';
  }

  public get tooltipKey(): string {
    return '';
  }

  public get icon(): string {
    return '';
  }

  public get isEnabled(): boolean {
    return true;
  }

  public get isVisible(): boolean {
    return this.isEnabled;
  }

  public get isCheckable(): boolean {
    return false;
  }

  public get isChecked(): boolean {
    return false;
  }

  /*
   *  Called when the command is invoked
   *  Return true if successful, false otherwise
   */
  protected invokeCore(): boolean {
    return false;
  }

  public isEqual(other: BaseCommand): boolean {
    return this.name === other.name;
  }

  // ==================================================
  // INSTANCE METHODS (Not to be overriden)
  // =================================================

  public getTooltipOld(): string {
    let tooltip = this.tooltip;
    if (isEmpty(tooltip)) tooltip = this.name;
    if (isEmpty(tooltip)) return tooltip;

    const shortCut = this.shortCutKey;
    if (!isEmpty(shortCut)) tooltip += ` [${shortCut}]`;
    return tooltip;
  }

  public invoke(): boolean {
    return this.invokeCore();
  }

  // ==================================================
  // INSTANCE METHODS: Event listeners
  // ==================================================

  public addEventListener(listener: UpdateToolDelegate): void {
    this._listeners.push(listener);
  }

  public removeEventListener(listener: UpdateToolDelegate): void {
    remove(this._listeners, listener);
  }

  public removeEventListeners(): void {
    clear(this._listeners);
  }

  public update(): void {
    for (const listener of this._listeners) {
      listener();
    }
  }
}
