import { IconType } from '@cognite/cogs.js';
import { TranslateKey } from '../../base/utilities/TranslateKey';
import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { ButtonType } from '../../../components/Architecture/types';
import { ObservationsTool } from './ObservationsTool';
import { ObservationsCommand } from './ObservationsCommand';

export class CreateObservationCommand extends ObservationsCommand {
  public override get icon(): IconType {
    return 'Plus';
  }

  public override get tooltip(): TranslateKey {
    return { key: 'ADD_OBSERVATION', fallback: 'Add observation. Click at a point' };
  }

  protected override invokeCore(): boolean {
    const tool = this.getTool();
    if (tool === undefined) {
      return false;
    }

    tool.setIsCreating(!tool.isCreating);

    return true;
  }
}
