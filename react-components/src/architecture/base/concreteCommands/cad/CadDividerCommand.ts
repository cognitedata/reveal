import { DividerCommand } from '../../commands/DividerCommand';

export class CadDividerCommand extends DividerCommand {
  public override get isVisible(): boolean {
    return this.renderTarget.getCadModels().next().value !== undefined;
  }
}
