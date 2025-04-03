import { BaseCommand, type TranslateDelegate } from '../../../../src/architecture';
import { type IconName } from '../../../../src/architecture/base/utilities/IconName';

export class TestButtonCommand extends BaseCommand {
  private readonly _delegate: (() => void) | undefined;
  private readonly _isToggle: boolean;

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
