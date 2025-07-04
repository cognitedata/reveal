import { type TranslationInput } from '../utilities/TranslateInput';
import { RenderTargetCommand } from './RenderTargetCommand';

export abstract class BaseInputCommand extends RenderTargetCommand {
  private _content: string = '';
  private _onCancel?: () => void;

  public getCancelButtonLabel(): TranslationInput | undefined {
    return undefined;
  }

  public abstract getPostButtonLabel(): TranslationInput | undefined;
  public abstract getPlaceholder(): TranslationInput | undefined;

  public get onCancel(): (() => void) | undefined {
    return this._onCancel;
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

  public get isPostButtonEnabled(): boolean {
    return this._content.length > 0;
  }
}
