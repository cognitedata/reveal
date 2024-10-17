/*!
 * Copyright 2024 Cognite AS
 */
import { DividerCommand } from '../../commands/DividerCommand';

export class Image360CollectionDividerCommand extends DividerCommand {
  public override get isVisible(): boolean {
    return this.renderTarget.get360ImageCollections().next().value !== undefined;
  }
}
