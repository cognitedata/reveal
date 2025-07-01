import { type IconName } from '../../../../src/architecture/base/utilities/IconName';
import { type TranslationInput } from '../../../../src/architecture/base/utilities/TranslateInput';
import { RenderTargetCommand } from '../../../../src/architecture/base/commands/RenderTargetCommand';

export class MockCommand extends RenderTargetCommand {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public isInvokedTimes = 0;
  public _isVisible = true;
  public _isEnabled = true;
  public _isChecked = false;
  public _isToggle = false;
  public _icon: IconName = 'Sun';
  public _tooltip: TranslationInput = { untranslated: 'Action' };

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return this._tooltip;
  }

  public override set tooltip(value: TranslationInput) {
    this._tooltip = value;
  }

  public override get icon(): IconName {
    return this._icon;
  }

  public override set icon(value: IconName) {
    this._icon = value;
    this.update();
  }

  public override get isEnabled(): boolean {
    return this._isEnabled;
  }

  public override set isEnabled(value: boolean) {
    this._isEnabled = value;
    this.update();
  }

  public override get isVisible(): boolean {
    return this._isVisible;
  }

  public override set isVisible(value: boolean) {
    this._isVisible = value;
    this.update();
  }

  public override get isChecked(): boolean {
    return this._isChecked;
  }

  public override set isChecked(value: boolean) {
    this._isChecked = value;
    this.update();
  }

  public override get isToggle(): boolean {
    return this._isToggle;
  }

  public override set isToggle(value: boolean) {
    this._isToggle = value;
    this.update();
  }

  protected override get shortCutKey(): string | undefined {
    return 'A';
  }

  protected override get shortCutKeyOnCtrl(): boolean {
    return true;
  }

  protected override get shortCutKeyOnShift(): boolean {
    return true;
  }

  protected override get shortCutKeyOnAlt(): boolean {
    return true;
  }

  protected override invokeCore(): boolean {
    if (this.isToggle) {
      this.isChecked = !this.isChecked;
    }
    this.isInvokedTimes++;
    return true;
  }
}
