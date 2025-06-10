import { type IconName } from '../utilities/IconName';
import {
  isTranslatedString,
  type TranslateDelegate,
  type TranslationInput
} from '../utilities/TranslateInput';
import { clear, remove } from '../utilities/extensions/arrayExtensions';
import { isMacOs } from '../utilities/extensions/isMacOs';

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
  private static _counter: number = 0; // Counter for the unique index

  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _listeners: CommandUpdateDelegate[] = [];
  private readonly _disposables: Array<() => void> = [];

  // Unique id for the command, used by in React to force rerender
  // when the command changes for a button.
  private readonly _uniqueId: number;

  public get uniqueId(): number {
    return this._uniqueId;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    BaseCommand._counter++;
    this._uniqueId = BaseCommand._counter;
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

  public get buttonType(): string {
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

  public dispose(): void {
    for (const child of this.getChildren()) {
      child.dispose();
    }
    for (const disposable of this._disposables) {
      disposable();
    }
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

  protected addDisposable(disposable: () => void): void {
    this._disposables.push(disposable);
  }

  public getLabel(translate: TranslateDelegate): string {
    return translate(this.tooltip ?? { untranslated: '' });
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
