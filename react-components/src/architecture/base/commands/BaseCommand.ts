/*!
 * Copyright 2024 Cognite AS
 */

import { clear, remove } from '../utilities/extensions/arrayExtensions';

type UpdateDelegate = (command: BaseCommand) => void;

export type Tooltip = {
  key: string;
  fallback: string;
};

export abstract class BaseCommand {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _listeners: UpdateDelegate[] = [];

  // ==================================================
  // VIRTUAL METHODS (To be override)
  // =================================================

  public get name(): string {
    return this.tooltip.fallback;
  }

  public get shortCutKey(): string | undefined {
    return undefined;
  }

  public get tooltip(): Tooltip {
    return { key: '', fallback: '' };
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
   * Called when the command is invoked
   * Return true if successful, false otherwise
   * Override this method to implement the command logic
   */
  protected invokeCore(): boolean {
    return false;
  }

  public equals(other: BaseCommand): boolean {
    return this.constructor === other.constructor;
  }

  public invoke(): boolean {
    return this.invokeCore();
  }

  public dispose(): void {
    this.removeEventListeners();
  }

  // ==================================================
  // INSTANCE METHODS: Event listeners
  // ==================================================

  public addEventListener(listener: UpdateDelegate): void {
    this._listeners.push(listener);
  }

  public removeEventListener(listener: UpdateDelegate): void {
    remove(this._listeners, listener);
  }

  public removeEventListeners(): void {
    clear(this._listeners);
  }

  public update(): void {
    for (const listener of this._listeners) {
      listener(this);
    }
  }
}
