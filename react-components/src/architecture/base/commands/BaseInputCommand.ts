/*!
 * Copyright 2024 Cognite AS
 */
import { Changes } from '../domainObjectsHelpers/Changes';
import { type TranslationInput } from '../utilities/TranslateInput';
import { RenderTargetCommand } from './RenderTargetCommand';

export abstract class BaseInputCommand extends RenderTargetCommand {
  protected _placeholder?: TranslationInput;
  protected _content: string = '';
  protected _okButtonLabel?: TranslationInput;

  protected _onFinish?: () => void;
  protected _onCancel?: () => void;

  public getCancelButtonLabel(): TranslationInput | undefined {
    return undefined;
  }

  public abstract getPostButtonLabel(): TranslationInput | undefined;

  public abstract getPlaceholder(): TranslationInput | undefined;

  public get onFinish(): (() => void) | undefined {
    return this._onFinish;
  }

  public set onFinish(onFinish: () => void) {
    this._onFinish = onFinish;
  }

  public set onCancel(onCancel: () => void) {
    this._onCancel = onCancel;
  }

  public get content(): string {
    return this._content;
  }

  public set content(content: string) {
    this._content = content;
    this.update();
  }

  public get onCancel(): (() => void) | undefined {
    return this._onCancel;
  }
}
