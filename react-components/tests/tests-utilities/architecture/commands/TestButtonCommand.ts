import { BaseCommand, TranslateDelegate, TranslationInput } from '../../../../src/architecture';
import { IconName } from '../../../../src/architecture/base/utilities/IconName';

export class TestButtonCommand extends BaseCommand {
  private _delegate: (() => void) | undefined;
  private _isToggle: boolean;

  constructor(properties?: { onClick?: () => void; isToggle?: boolean }) {
    super();
    this._delegate = properties?.onClick;
    this._isToggle = properties?.isToggle ?? false;
  }

  public override invokeCore(): boolean {
    this._delegate?.();
    return true;
  }

  public override getLabel(t: TranslateDelegate): string {
    return t({ untranslated: 'Test button' });
  }

  public override get isToggle(): boolean {
    return this._isToggle;
  }

  public override get icon(): IconName {
    return 'Circle';
  }
}
