/*!
 * Copyright 2024 Cognite AS
 */
import { type TranslationInput } from '../utilities/TranslateInput';
import { RenderTargetCommand } from './RenderTargetCommand';

export abstract class BaseInputCommand extends RenderTargetCommand {
  private _content: string = '';
  private _onCancel?: VoidFunction;

  public getCancelButtonLabel(): TranslationInput | undefined {
    return undefined;
  }

  public abstract getPostButtonLabel(): TranslationInput | undefined;
  public abstract getPlaceholder(): TranslationInput | undefined;

  public get onCancel(): VoidFunction | undefined {
    return this._onCancel;
  }

  public set onCancel(onCancel: VoidFunction) {
    this._onCancel = onCancel;
  }

  public get content(): string {
    return this._content;
  }

  public set content(content: string) {
    this._content = content;
    this.update();
  }

  public get isPostButtonEnabled(): boolean {
    return this._content.length > 0;
  }
}
