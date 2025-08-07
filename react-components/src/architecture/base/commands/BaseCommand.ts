import { effect, type Signal } from '@cognite/signals';
import { type IconName } from '../utilities/IconName';
import { isTranslatedString, type TranslationInput } from '../utilities/TranslateInput';
import { clear, remove } from '../utilities/extensions/arrayUtils';
import { isMacOs } from '../utilities/extensions/isMacOs';
import { translate } from '../utilities/translateUtils';
import { generateUniqueId, type ButtonType, type UniqueId } from '../utilities/types';

/**
 * Represents a delegate function for updating a command.
 *
 * @param command - The command to be updated.
 * @param change - An optional symbol representing the change made to the command.
 * if not set, anything can be changed. See changes is CommandChanges for common legal changes.
 */
export type CommandUpdateDelegate = (command: BaseCommand, change?: symbol) => void;

/**
 * Base class for all command and tools. These are object that can do a
 * user interaction with the system. It also have enough information to
 * generate the UI for the command.
 */

export abstract class BaseCommand {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _listeners: CommandUpdateDelegate[] = [];
  private readonly _disposables: Array<() => void> = [];

  public get disposableCount(): number {
    return this._disposables.length;
  }

  // Unique id for the command, used by in React to force rerender
  // when the command changes for a button.
  private readonly _uniqueId: UniqueId;

  public get uniqueId(): UniqueId {
    return this._uniqueId;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    this._uniqueId = generateUniqueId();
  }

  // ==================================================
  // VIRTUAL METHODS (To be overridden)
  // =================================================

  public get name(): string {
    if (this.tooltip === undefined) {
      return '';
    }
    return isTranslatedString(this.tooltip) ? this.tooltip.key : this.tooltip?.untranslated;
  }

  protected get shortCutKey(): string | undefined {
    return undefined;
  }

  protected get shortCutKeyOnCtrl(): boolean {
    return false;
  }

  protected get shortCutKeyOnAlt(): boolean {
    return false;
  }

  protected get shortCutKeyOnShift(): boolean {
    return false;
  }

  public get tooltip(): TranslationInput | undefined {
    return undefined;
  }

  public get icon(): IconName {
    return undefined; // Means no icon
  }

  public get buttonType(): ButtonType {
    return 'ghost';
  }

  public get isEnabled(): boolean {
    return true;
  }

  public get isVisible(): boolean {
    return this.isEnabled;
  }

  /**
   * Gets a value indicating whether the command can be toggled on or off.
   * Override this property if the command can be toggled.
   * You must also override isChecked to get the toggle state.
   */
  public get isToggle(): boolean {
    return false;
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

  protected *getChildren(): Generator<BaseCommand> {}

  public *getDescendants(): Generator<BaseCommand> {
    for (const child of this.getChildren()) {
      yield child;
      yield* child.getDescendants();
    }
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

  /**
   * Removes the core functionality of the command
   * This method should be overridden in derived classes to provide custom implementation.
   * @remarks
   * Always call `super.dispose()` in the overrides.
   */
  public dispose(): void {
    for (const child of this.getChildren()) {
      child.dispose();
    }
    for (const disposable of this._disposables) {
      disposable();
    }
    clear(this._disposables);
    this.removeEventListeners();
  }

  // ==================================================
  // INSTANCE METHODS: Event listeners
  // ==================================================

  public addEventListener(listener: CommandUpdateDelegate): void {
    this._listeners.push(listener);
  }

  public removeEventListener(listener: CommandUpdateDelegate): void {
    remove(this._listeners, listener);
  }

  public removeEventListeners(): void {
    clear(this._listeners);
  }

  public update(change?: symbol): void {
    for (const listener of this._listeners) {
      listener(this, change);
    }
    for (const child of this.getChildren()) {
      child.update(change);
    }
  }

  // ==================================================
  // INSTANCE METHODS: Others (Not to be overridden)
  // ==================================================

  public get label(): string {
    return this.tooltip !== undefined ? translate(this.tooltip) : '';
  }

  protected addDisposable(disposable: () => void): void {
    this._disposables.push(disposable);
  }

  protected addEffect(effectFunction: () => void): void {
    this.addDisposable(
      effect(() => {
        effectFunction();
      })
    );
  }

  protected listenTo<T>(signal: Signal<T>): void {
    this.addEffect(() => {
      signal();
      this.update();
    });
  }

  public getShortCutKeys(): string[] | undefined {
    const key = this.shortCutKey;
    if (key === undefined) {
      return undefined;
    }
    const keys: string[] = [];
    if (this.shortCutKeyOnCtrl) {
      keys.push(isMacOs() ? 'Cmd' : 'Ctrl');
    }
    if (this.shortCutKeyOnAlt) {
      keys.push('Alt');
    }
    if (this.shortCutKeyOnShift) {
      keys.push('Shift');
    }
    keys.push(key);
    return keys;
  }

  public hasShortCutKey(key: string, ctrl: boolean, shift: boolean, alt: boolean): boolean {
    return (
      this.shortCutKey === key &&
      this.shortCutKeyOnCtrl === ctrl &&
      this.shortCutKeyOnShift === shift &&
      this.shortCutKeyOnAlt === alt
    );
  }
}
