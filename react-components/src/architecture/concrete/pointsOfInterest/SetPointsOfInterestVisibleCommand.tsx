import { VisibleState } from '../../base/domainObjectsHelpers/VisibleState';
import { type TranslationInput } from '../../base/utilities/translation/TranslateInput';
import { PointsOfInterestCommand } from './PointsOfInterestCommand';
import { PointsOfInterestDomainObject } from './PointsOfInterestDomainObject';

export class SetPointsOfInterestVisibleCommand<
  PoiIdType
> extends PointsOfInterestCommand<PoiIdType> {
  public override get isToggle(): boolean {
    return true;
  }

  public override get tooltip(): TranslationInput {
    return { key: 'POINT_OF_INTEREST_PLURAL' };
  }

  public override get isChecked(): boolean {
    return this.poiDomainObject?.getVisibleState(this.renderTarget) === VisibleState.All;
  }

  protected override invokeCore(): boolean {
    const visible = !this.isChecked;

    this.poiDomainObject?.setVisibleInteractive(visible, this.renderTarget);

    return true;
  }

  private get poiDomainObject(): PointsOfInterestDomainObject<PoiIdType> | undefined {
    return this.root.getDescendantByType(PointsOfInterestDomainObject);
  }
}
