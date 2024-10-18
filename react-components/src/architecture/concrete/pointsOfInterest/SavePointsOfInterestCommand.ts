/*!
 * Copyright 2024 Cognite AS
 */
import { type ButtonType } from '../../../components/Architecture/types';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { PointsOfInterestCommand } from './PointsOfInterestCommand';
import { type IconName } from '../../base/utilities/IconName';
import { CommandsUpdater } from '../../base/reactUpdaters/CommandsUpdater';
import { makeToast } from '@cognite/cogs-lab';

export class SavePointsOfInterestCommand<PoIIdType> extends PointsOfInterestCommand<PoIIdType> {
  public override get icon(): IconName {
    return 'Save';
  }

  public override get tooltip(): TranslateKey {
    return { fallback: 'Publish point of interest changes' };
  }

  public override get buttonType(): ButtonType {
    return 'primary';
  }

  public override get isEnabled(): boolean {
    const domainObject = this.getPointsOfInterestDomainObject();

    return (
      domainObject !== undefined &&
      (domainObject.hasPendingPointsOfInterest() ||
        domainObject.hasPendingDeletionPointsOfInterest())
    );
  }

  protected override invokeCore(): boolean {
    const tool = this.getTool();
    if (tool === undefined) {
      return false;
    }

    const domainObject = this.getPointsOfInterestDomainObject();

    void domainObject
      ?.save()
      .then(() => {
        makeToast({
          body: { fallback: 'Successfully published changes' }.fallback,
          type: 'success'
        });
        const domainObject = this.getPointsOfInterestDomainObject();
        domainObject?.notify(Changes.geometry);
        CommandsUpdater.update(this.renderTarget);
      })
      .catch((e) => {
        makeToast({
          body: { fallback: 'Unable to publish point of interest changes: ' + e }.fallback,
          type: 'warning'
        });
        throw e;
      });

    return true;
  }
}
