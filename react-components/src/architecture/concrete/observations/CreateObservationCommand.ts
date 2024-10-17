/*!
 * Copyright 2024 Cognite AS
 */
import { type IconName } from '../../base/utilities/IconName';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { ObservationCommand } from './ObservationsCommand';

export class CreateObservationCommand<
  ObservationIdType
> extends ObservationCommand<ObservationIdType> {
  public override get icon(): IconName {
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
