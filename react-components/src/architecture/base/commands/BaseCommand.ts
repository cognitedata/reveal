/*!
 * Copyright 2024 Cognite AS
 */

import { type TranslateKey } from '../utilities/TranslateKey';
import { clear, remove } from '../utilities/extensions/arrayExtensions';

type UpdateDelegate = (command: BaseCommand) => void;

/**
 * Base class for all command and tools. These are object that can do a
 * user interaction with the system. It also have enough information to
 * generate the UI for the command.
 */

export abstract class BaseCommand {
  private static _counter: number = 0; // Counter for the unique index

  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _listeners: UpdateDelegate[] = [];

  // Unique index for the command, used by in React to force rerender
  // when the command changes for a button.
  public readonly _uniqueIndex: number;

  public get uniqueIndex(): number {
    return this._uniqueIndex;
  }

  // ==================================================
  // VIRTUAL METHODS (To be override)
  // =================================================

  constructor() {
    BaseCommand._counter++;
    this._uniqueIndex = BaseCommand._counter;
  }

  public get name(): string {
    return this.tooltip.fallback ?? this.tooltip.key;
  }

  public get shortCutKey(): string | undefined {
    return undefined;
  }

  public get tooltip(): TranslateKey {
    return { key: '' };
  }

  public get icon(): string {
    return 'Unknown';
  }

  public get buttonType(): string {
    return 'ghost';
  }

  public get isEnabled(): boolean {
    return true;
  }

  public get isVisible(): boolean {
    return this.isEnabled;
  }

  public get isChecked(): boolean {
    return false;
  }

  /**
   * Gets a value indicating whether the command has data, for instance a reference
   * to a specific domain object. Then the command cannot be reused or shared in the user interface.
   * These command will not be added to the commandsController for updating, so update will
   * not be done automatically. Typically used when the command is created for a specific domain object
   * in the DomainObjectPanel.
   */
  public get hasData(): boolean {
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
