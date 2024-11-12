/*!
 * Copyright 2024 Cognite AS
 */
import { type TranslateDelegate, type TranslateKey } from '../utilities/TranslateKey';
import { RenderTargetCommand } from './RenderTargetCommand';

export class BaseInputCommand extends RenderTargetCommand {
  protected _placeholder?: TranslateKey;
  protected _content?: string;
  protected _okButtonLabel?: TranslateKey;
  protected _cancelButtonLabel?: TranslateKey;

  protected _onFinish?: () => void;
  protected _onCancel?: () => void;

  getCancelButtonLabel(t: TranslateDelegate): string | undefined {
    if (this._cancelButtonLabel?.key === undefined) {
      return undefined;
    }
    return t(this._cancelButtonLabel?.key, this._cancelButtonLabel?.fallback);
  }

  getPostButtonLabel(t: TranslateDelegate): string | undefined {
    if (this._okButtonLabel?.key === undefined) {
      return undefined;
    }
    return t(this._okButtonLabel?.key, this._okButtonLabel?.fallback);
  }

  getPlaceholder(t: TranslateDelegate): string | undefined {
    if (this._placeholder?.key === undefined) {
      return undefined;
    }
    return t(this._placeholder?.key, this._placeholder?.fallback);
  }

  public get onFinish(): () => void {
    return this._onFinish;
  }

  public set onFinish(onFinish: () => void) {
    this._onFinish = onFinish;
  }

  public set onCancel(onCancel: () => void) {
    this._onCancel = onCancel;
  }

  public get onCancel(): (() => void) | undefined {
    return this._onCancel;
  }

  invokeWithContent(content: string): boolean {
    this._content = content;
    return this.invoke();
  }
}
