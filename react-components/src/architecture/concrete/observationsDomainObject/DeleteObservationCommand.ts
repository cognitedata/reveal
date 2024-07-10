import { IconType } from '@cognite/cogs.js';
import { TranslateKey } from '../../base/utilities/TranslateKey';
import { ButtonType } from '../../../components/Architecture/types';
import { ObservationsCommand } from './ObservationsCommand';

export class DeleteObservationCommand extends ObservationsCommand {
  public override get icon(): IconType {
    return 'Delete';
  }

  public override get tooltip(): TranslateKey {
    return { fallback: 'Delete observation' };
  }

  public override get buttonType(): ButtonType {
    return 'ghost-destructive';
  }

  public override get shortCutKey(): string {
    return 'DELETE';
  }

  public override get isEnabled(): boolean {
    const observation = this.getObservationsDomainObject();

    return observation?.getSelectedOverlay() !== undefined;
  }

  protected override invokeCore(): boolean {
    const observations = this.getObservationsDomainObject();
    const selectedOverlay = observations?.getSelectedOverlay();
    if (selectedOverlay === undefined) {
      return false;
    }

    observations?.removeObservation(selectedOverlay);

    return true;
  }
}
