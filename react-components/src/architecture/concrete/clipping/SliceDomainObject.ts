/*!
 * Copyright 2024 Cognite AS
 */

import { Color } from 'three';
import { PlaneDomainObject } from '../primitives/plane/PlaneDomainObject';
import { PrimitiveType } from '../../base/utilities/primitives/PrimitiveType';
import { type TranslationInput } from '../../base/utilities/TranslateInput';
import { type BaseCommand } from '../../base/commands/BaseCommand';
import { FlipSliceCommand } from './commands/FlipSliceCommand';
import { setClippingPlanes } from './commands/setClippingPlanes';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { FocusType } from '../../base/domainObjectsHelpers/FocusType';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { getRoot } from '../../base/domainObjects/getRoot';

export class SliceDomainObject extends PlaneDomainObject {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(primitiveType: PrimitiveType) {
    super(primitiveType);
    this.color = new Color(Color.NAMES.orangered);
    this._backSideColor = new Color(Color.NAMES.palegreen);
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get typeName(): TranslationInput {
    switch (this.primitiveType) {
      case PrimitiveType.PlaneX:
        return { key: 'SLICE_X' };
      case PrimitiveType.PlaneY:
        return { key: 'SLICE_Y' };
      case PrimitiveType.PlaneZ:
        return { key: 'SLICE_Z' };
      case PrimitiveType.PlaneXY:
        return { key: 'SLICE_XY' };
      default:
        throw new Error('Unknown PrimitiveType');
    }
  }

  public override getPanelToolbar(): BaseCommand[] {
    const commands = super.getPanelToolbar();
    commands.push(new FlipSliceCommand(this));
    return commands;
  }

  protected override notifyCore(change: DomainObjectChange): void {
    super.notifyCore(change);

    if (
      change.isChanged(
        Changes.selected,
        Changes.deleted,
        Changes.added,
        Changes.geometry,
        Changes.dragging
      )
    ) {
      if (change.isChanged(Changes.deleted)) {
        this.focusType = FocusType.Pending; // Make sure that the slice is not used in clipping anymore
      }
      this.updateClippingPlanes();
    }
  }

  public override get useClippingInIntersection(): boolean {
    return false;
  }

  public override clone(what?: symbol): DomainObject {
    const clone = new SliceDomainObject(this.primitiveType);
    clone.copyFrom(this, what);
    return clone;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private updateClippingPlanes(): void {
    // Update the clipping planes if necessary
    const root = getRoot(this);
    if (root === undefined) {
      return;
    }
    const renderTarget = root.renderTarget;
    if (!renderTarget.isGlobalClippingActive) {
      return;
    }
    if (renderTarget.isGlobalCropBoxActive) {
      return;
    }
    setClippingPlanes(root);
  }
}
