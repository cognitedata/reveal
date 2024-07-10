import { IconType, toast } from '@cognite/cogs.js';
import { ButtonType } from '../../../components/Architecture/types';
import { TranslateKey } from '../../base/utilities/TranslateKey';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { ObservationsCommand } from './ObservationsCommand';

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

    void tool
      .save()
      .then(() => {
        toast.success({ fallback: 'Successfully published changes' }.fallback);

        const observation = this.getObservationsDomainObject();
        observation?.notify(Changes.geometry);
        this.renderTarget.commandsController.update();
      })
      .catch((e) => {
        toast.error({ fallback: 'Unable to publish observation changes: ' + e }.fallback);
        throw e;
      });

    return true;
  }
}
