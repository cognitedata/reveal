import { Vector3 } from 'three';
import { getDefaultCommand } from '../../../components/Architecture/utilities';
import { BaseInputCommand } from '../../base/commands/BaseInputCommand';
import { PointsOfInterestTool } from './PointsOfInterestTool';

export class CreatePointsOfInterestWithDescriptionCommand extends BaseInputCommand {
  private _point?: Vector3;

  constructor() {
    super();

    this._placeholder = {
      key: 'POI_DESCRIPTION_PLACEHOLDER',
      fallback: 'Write a points of interest description'
    };

    this._okButtonLabel = {
      key: 'CREATE',
      fallback: 'Create'
    };

    this._cancelButtonLabel = {
      key: 'CANCEL',
      fallback: 'Cancel'
    };
  }

  public set position(position: Vector3) {
    this._point = position;
  }

  public override invokeCore(): boolean {
    if (this._point === undefined) {
      return false;
    }

    const poiTool = getDefaultCommand(new PointsOfInterestTool(), this.renderTarget);

    const poi = poiTool.createPendingPointOfInterestAtPosition(this._point, this._content);
    this._onFinish?.();
    const result = poiTool.savePointsOfInterestInstances.invoke();
    const domainObject = poiTool.getPointsOfInterestDomainObject();
    domainObject?.setSelectedPointsOfInterest(poi);

    return result;
  }
}
