/*!
 * Copyright 2024 Cognite AS
 */
import { type IconType } from '@cognite/cogs.js';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
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
