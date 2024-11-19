/*!
 * Copyright 2024 Cognite AS
 */
import { type TranslateDelegate, type TranslationInput } from '../utilities/TranslateInput';
import { RenderTargetCommand } from './RenderTargetCommand';

export abstract class BaseInputCommand extends RenderTargetCommand {
  protected _placeholder?: TranslationInput;
  protected _content?: string;
  protected _okButtonLabel?: TranslationInput;

  protected _onFinish?: () => void;
  protected _onCancel?: () => void;

  public getCancelButtonLabel(_t: TranslateDelegate): string | undefined {
    return undefined;
  }

  public abstract getPostButtonLabel(t: TranslateDelegate): string | undefined;

  public abstract getPlaceholder(t: TranslateDelegate): string | undefined;

  public get onFinish(): (() => void) | undefined {
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

    const invokeResult = this.invoke();
    this._content = '';
    return invokeResult;
  }
}
