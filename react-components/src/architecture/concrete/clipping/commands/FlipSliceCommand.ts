import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type TranslationInput } from '../../../base/utilities/TranslateInput';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { type SliceDomainObject } from '../SliceDomainObject';
import { DomainObjectCommand } from '../../../base/commands/DomainObjectCommand';
import { type IconName } from '../../../base/utilities/IconName';

export class FlipSliceCommand extends DomainObjectCommand<SliceDomainObject> {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { key: 'SLICE_FLIP' };
  }

  public override get icon(): IconName {
    if (this._domainObject.primitiveType === PrimitiveType.PlaneZ) {
      return 'FlipHorizontal';
    }
    return 'FlipVertical'; // Maybe 'Exchange'; instead
  }

  protected override invokeCore(): boolean {
    this.addTransaction(this._domainObject.createTransaction(Changes.geometry));
    this._domainObject.flip();
    this._domainObject.notify(Changes.geometry);
    return true;
  }
}
