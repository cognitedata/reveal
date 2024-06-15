/*!
 * Copyright 2024 Cognite AS
 */

import { BaseCommand } from '../../../base/commands/BaseCommand';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { PrimitiveType } from '../../primitives/PrimitiveType';
import { type SliceDomainObject } from '../SliceDomainObject';

export class FlipSliceCommand extends BaseCommand {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _domainObject: SliceDomainObject;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(domainObject: SliceDomainObject) {
    super();
    this._domainObject = domainObject;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'SLICE_FLIP', fallback: 'Flip side on this slice' };
  }

  public override get icon(): string {
    if (this._domainObject.primitiveType === PrimitiveType.PlaneZ) {
      return 'FlipHorizontal';
    }
    return 'FlipVertical'; // Maybe 'Exchange'; instead
  }

  public override get hasData(): boolean {
    return true;
  }

  protected override invokeCore(): boolean {
    this._domainObject.flip();
    this._domainObject.notify(Changes.geometry);
    return true;
  }
}
