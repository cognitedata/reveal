/*!
 * Copyright 2024 Cognite AS
 */
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { type ButtonType } from '../../../components/Architecture/types';
import { ObservationCommand } from './ObservationsCommand';
import { type IconName } from '../../base/utilities/IconName';

export class DeleteObservationCommand<
  ObservationIdType
> extends ObservationCommand<ObservationIdType> {
  public override get icon(): IconName {
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

    return observation?.selectedObservation !== undefined;
  }

  protected override invokeCore(): boolean {
    const observations = this.getObservationsDomainObject();
    const selectedOverlay = observations?.selectedObservation;
    if (observations === undefined || selectedOverlay === undefined) {
      return false;
    }

    observations.removeObservation(selectedOverlay);
    observations.setSelectedObservation(undefined);

    return true;
  }
}
