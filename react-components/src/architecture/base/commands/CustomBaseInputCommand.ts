/*!
 * Copyright 2024 Cognite AS
 */
import { type TranslationInput } from '../utilities/TranslateInput';
import { RenderTargetCommand } from './RenderTargetCommand';

export type FieldContent = {
  type: 'text' | 'commentWithButtons';
  content: string;
};

export abstract class CustomBaseInputCommand extends RenderTargetCommand {
  protected _placeholders?: TranslationInput[];
  protected _contents?: FieldContent[];
  protected _okButtonLabel?: TranslationInput;

  protected _onFinish?: () => void;
  protected _onCancel?: () => void;

  public getCancelButtonLabel(): TranslationInput | undefined {
    return undefined;
  }

  public abstract getPostButtonLabel(): TranslationInput | undefined;

  public abstract getPlaceholderByIndex(index: number): TranslationInput | undefined;

  public abstract getAllPlaceholders(): TranslationInput[] | undefined;

  public get contents(): FieldContent[] {
    return this._contents ?? [];
  }

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

  invokeWithContent(contents: FieldContent[]): boolean {
    this._contents = contents;

    const invokeResult = this.invoke();
    this._contents = this._contents.map((content) => ({ type: content.type, content: '' }));
    return invokeResult;
  }
}
