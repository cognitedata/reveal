/*!
 * Copyright 2024 Cognite AS
 */
import { type TranslateDelegate, type TranslateKey } from '../utilities/TranslateKey';
import { RenderTargetCommand } from './RenderTargetCommand';

export abstract class BaseInputCommand extends RenderTargetCommand {
  protected _placeholder?: TranslateKey;
  protected _content?: string;
  protected _okButtonLabel?: TranslateKey;

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
    this._onFinish?.();
    return invokeResult;
  }
}
