/*!
 * Copyright 2024 Cognite AS
 */
import { RenderTargetCommand } from './RenderTargetCommand';

export class DividerCommand extends RenderTargetCommand {
  public override get isVisible(): boolean {
    return true;
  }
}
