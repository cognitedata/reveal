/*!
 * Copyright 2024 Cognite AS
 */

import { Color } from 'three';
import { PlaneDomainObject } from '../primitives/plane/PlaneDomainObject';
import { PrimitiveType } from '../../base/utilities/primitives/PrimitiveType';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { type BaseCommand } from '../../base/commands/BaseCommand';
import { FlipSliceCommand } from './commands/FlipSliceCommand';
import { ApplyClipCommand } from './commands/ApplyClipCommand';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { FocusType } from '../../base/domainObjectsHelpers/FocusType';
import { type DomainObject } from '../../base/domainObjects/DomainObject';

export class SliceDomainObject extends PlaneDomainObject {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(primitiveType: PrimitiveType) {
    super(primitiveType);
    this.color = new Color(Color.NAMES.orangered);
    this.backSideColor = new Color(Color.NAMES.palegreen);
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get typeName(): TranslateKey {
    switch (this.primitiveType) {
      case PrimitiveType.PlaneX:
        return { key: 'SLICE_X', fallback: 'Vertical slice along Y-axis' };
      case PrimitiveType.PlaneY:
        return { key: 'SLICE_Y', fallback: 'Vertical slice along X-axis' };
      case PrimitiveType.PlaneZ:
        return { key: 'SLICE_Z', fallback: 'Horizontal slice' };
      case PrimitiveType.PlaneXY:
        return { key: 'SLICE_XY', fallback: 'Vertical slice' };
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
    const root = this.rootDomainObject;
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
    ApplyClipCommand.setClippingPlanes(root);
  }
}
