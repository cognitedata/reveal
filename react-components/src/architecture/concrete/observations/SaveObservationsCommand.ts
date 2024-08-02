/*!
 * Copyright 2024 Cognite AS
 */
import { type IconType, toast } from '@cognite/cogs.js';
import { type ButtonType } from '../../../components/Architecture/types';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { ObservationsCommand } from './ObservationsCommand';
import { CommandsUpdater } from '../../base/reactUpdaters/CommandsUpdater';

export class SaveObservationsCommand extends ObservationsCommand {
  public override get icon(): IconType {
    return 'Save';
  }

  public override get tooltip(): TranslateKey {
    return { fallback: 'Publish observation changes' };
  }

  public override get buttonType(): ButtonType {
    return 'primary';
  }

  public override get isEnabled(): boolean {
    const observation = this.getObservationsDomainObject();

    return (
      observation !== undefined &&
      (observation.hasPendingObservations() || observation.hasPendingDeletionObservations())
    );
  }

  protected override invokeCore(): boolean {
    const tool = this.getTool();
    if (tool === undefined) {
      return false;
    }

    const domainObject = this.getObservationsDomainObject();

    void domainObject
      ?.save()
      .then(() => {
        toast.success({ fallback: 'Successfully published changes' }.fallback);

        const observation = this.getObservationsDomainObject();
        observation?.notify(Changes.geometry);
        CommandsUpdater.update(this.renderTarget);
      })
      .catch((e) => {
        toast.error({ fallback: 'Unable to publish observation changes: ' + e }.fallback);
        throw e;
      });

    return true;
  }
}
