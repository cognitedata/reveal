/*!
 * Copyright 2024 Cognite AS
 */
import { DividerCommand } from '../../commands/DividerCommand';

export class PointCloudDividerCommand extends DividerCommand {
  public override get isVisible(): boolean {
    return this.renderTarget.getPointClouds().next().value !== undefined;
  }
}
