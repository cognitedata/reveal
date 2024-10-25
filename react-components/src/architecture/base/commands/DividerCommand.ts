/*!
 * Copyright 2024 Cognite AS
 */
import { type BaseCommand } from './BaseCommand';
import { RenderTargetCommand } from './RenderTargetCommand';

export class DividerCommand extends RenderTargetCommand {
  public override get isVisible(): boolean {
    return true;
  }

  public override equals(other: BaseCommand): boolean {
    return this === other;
  }

  protected override invokeCore(): boolean {
    throw Error('invoke should never be called on a divider.');
  }
}
