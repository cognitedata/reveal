import { BaseCommand } from '../commands/BaseCommand';
import { RenderTargetCommand } from '../commands/RenderTargetCommand';

export class DividerCommand extends RenderTargetCommand {}

export class PointCloudDividerCommand extends DividerCommand {
  public override get isVisible(): boolean {
    return this.renderTarget.getPointClouds().next().value !== undefined;
  }

  public override equals(other: BaseCommand): boolean {
    return this === other;
  }
}
