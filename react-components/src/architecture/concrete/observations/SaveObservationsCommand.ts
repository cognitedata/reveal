/*!
 * Copyright 2024 Cognite AS
 */
import { type ButtonType } from '../../../components/Architecture/types';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { ObservationsCommand } from './ObservationsCommand';
import { type IconName } from '../../base/utilities/IconName';
import { CommandsUpdater } from '../../base/reactUpdaters/CommandsUpdater';

export class SaveObservationsCommand extends ObservationsCommand {
  public override get icon(): IconName {
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
        const observation = this.getObservationsDomainObject();
        observation?.notify(Changes.geometry);
        CommandsUpdater.update(this.renderTarget);
      })
      .catch((e) => {
        throw e;
      });

    return true;
  }
}
