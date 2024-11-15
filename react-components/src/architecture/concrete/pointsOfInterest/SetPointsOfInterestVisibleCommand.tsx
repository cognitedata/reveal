/*!
 * Copyright 2024 Cognite AS
 */
import { VisibleState } from '../../base/domainObjectsHelpers/VisibleState';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { PointsOfInterestCommand } from './PointsOfInterestCommand';
import { PointsOfInterestDomainObject } from './PointsOfInterestDomainObject';
import { PointsOfInterestTool } from './PointsOfInterestTool';

export class SetPointsOfInterestVisibleCommand<
  PoIIdType
> extends PointsOfInterestCommand<PoIIdType> {
  public override get isToggle(): boolean {
    return true;
  }

  public override get tooltip(): TranslateKey {
    return { key: 'VISIBLE', fallback: 'Visible' };
  }

  public override get isChecked(): boolean {
    return this.poiDomainObject?.getVisibleState(this.renderTarget) === VisibleState.All;
  }

  protected override invokeCore(): boolean {
    const visible = !this.isChecked;

    this.poiDomainObject?.setVisibleInteractive(visible, this.renderTarget);

    return true;
  }

  private get poiDomainObject() {
    return this.renderTarget.rootDomainObject.getDescendantByType(PointsOfInterestDomainObject);
  }
}
