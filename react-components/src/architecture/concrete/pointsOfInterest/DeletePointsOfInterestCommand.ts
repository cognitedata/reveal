import { type TranslationInput } from '../../base/utilities/TranslateInput';
import { type ButtonType } from '../../../components/Architecture/types';
import { PointsOfInterestCommand } from './PointsOfInterestCommand';
import { type IconName } from '../../base/utilities/IconName';

export class DeleteSelectedPointsOfInterestCommand<
  PoiIdType
> extends PointsOfInterestCommand<PoiIdType> {
  public override get icon(): IconName {
    return 'Delete';
  }

  public override get tooltip(): TranslationInput {
    return { key: 'POINT_OF_INTEREST_DELETE_THIS' };
  }

  public override get buttonType(): ButtonType {
    return 'ghost-destructive';
  }

  protected override get shortCutKey(): string {
    return 'DELETE';
  }

  public override get isEnabled(): boolean {
    const poi = this.getPointsOfInterestDomainObject();

    return poi?.selectedPointsOfInterest !== undefined;
  }

  protected override invokeCore(): boolean {
    const pois = this.getPointsOfInterestDomainObject();
    const selectedOverlay = pois?.selectedPointsOfInterest;
    if (pois === undefined || selectedOverlay === undefined) {
      return false;
    }

    pois.removePointsOfInterest(selectedOverlay);
    pois.setSelectedPointOfInterest(undefined);
    void pois.save();

    return true;
  }
}
