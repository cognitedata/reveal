import { getDefaultCommand } from '../../../components/Architecture/utilities';
import { BaseInputCommand } from '../../base/commands/BaseInputCommand';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { PointsOfInterestDomainObject } from './PointsOfInterestDomainObject';
import { PointsOfInterestTool } from './PointsOfInterestTool';
import { PointOfInterest } from './types';

export class CreatePoICommentCommand extends BaseInputCommand {
  private _poi?: PointOfInterest<unknown>;

  constructor() {
    super();

    this._placeholder = {
      key: 'COMMENT_PLACEHOLDER',
      fallback: 'Write a comment'
    };

    this._okButtonLabel = {
      key: 'SEND',
      fallback: 'Send'
    };

    this._cancelButtonLabel = {
      key: 'CANCEL',
      fallback: 'Cancel'
    };
  }

  public set poi(poi: PointOfInterest<unknown>) {
    console.log('Poi set to ', poi);
    this._poi = poi;
  }

  public override invokeCore(): boolean {
    console.log('Poi = ', this._poi, ', content = ', this._content);
    if (this._poi === undefined || this._content === undefined) {
      console.log('Away');
      return false;
    }

    const domainObject = this.rootDomainObject.getDescendantByType(PointsOfInterestDomainObject);

    domainObject?.postCommentForPoi(this._poi, this._content);
    console.log('Posted comment with content!', this._content);
    domainObject?.notify(Changes.addedPart);
    return true;
  }
}
