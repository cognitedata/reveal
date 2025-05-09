import { type TranslationInput } from '../../../../src/architecture';
import { BaseInputCommand } from '../../../../src/architecture/base/commands/BaseInputCommand';

export type TestInputCommandOptions = {
  postButtonLabel?: string;
  cancelButtonLabel?: string;
  placeholder?: string;
  onInvokeCallback?: (() => void) | undefined;
};

export class TestInputCommand extends BaseInputCommand {
  private readonly _postButtonLabel: string | undefined;
  private readonly _cancelButtonLabel: string | undefined;
  private readonly _placeholderText: string | undefined;
  private readonly _onInvokeCallback: (() => void) | undefined;

  private _isPostButtonEnabled: boolean = true;

  constructor(options?: TestInputCommandOptions) {
    super();
    if (options === undefined) {
      return;
    }

    const { postButtonLabel, cancelButtonLabel, placeholder, onInvokeCallback } = options;

    this._postButtonLabel = postButtonLabel;
    this._cancelButtonLabel = cancelButtonLabel;
    this._placeholderText = placeholder;
    this._onInvokeCallback = onInvokeCallback;
  }

  public override getPostButtonLabel(): TranslationInput | undefined {
    return this._postButtonLabel === undefined
      ? undefined
      : { untranslated: this._postButtonLabel };
  }

  public override getCancelButtonLabel(): TranslationInput | undefined {
    return this._cancelButtonLabel === undefined
      ? undefined
      : { untranslated: this._cancelButtonLabel };
  }

  public override getPlaceholder(): TranslationInput | undefined {
    return this._placeholderText === undefined
      ? undefined
      : { untranslated: this._placeholderText };
  }

  public setPostButtonEnabled(enable: boolean): void {
    this._isPostButtonEnabled = enable;
    this.update();
  }

  public override get isPostButtonEnabled(): boolean {
    return this._isPostButtonEnabled;
  }

  public override invokeCore(): boolean {
    this._onInvokeCallback?.();

    return true;
  }
}
