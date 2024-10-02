/*!
 * Copyright 2024 Cognite AS
 */

import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { type SliceDomainObject } from '../SliceDomainObject';
import { DomainObjectCommand } from '../../../base/commands/DomainObjectCommand';

export class FlipSliceCommand extends DomainObjectCommand<SliceDomainObject> {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'SLICE_FLIP', fallback: 'Flip side' };
  }

  public override get icon(): string {
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
