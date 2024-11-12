/*!
 * Copyright 2024 Cognite AS
 */

import { type SolidPrimitiveRenderStyle } from './SolidPrimitiveRenderStyle';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { BoxFace } from './BoxFace';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { type PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { VisualDomainObject } from '../../../base/domainObjects/VisualDomainObject';
import { getIconByPrimitiveType } from '../../../base/utilities/primitives/getIconByPrimitiveType';
import { DomainObjectTransaction } from '../../../base/undo/DomainObjectTransaction';
import { type Transaction } from '../../../base/undo/Transaction';
import { type IconName } from '../../../base/utilities/IconName';

export abstract class SolidDomainObject extends VisualDomainObject {
  // For focus when edit in 3D (Used when isSelected is true only)
  public focusFace: BoxFace | undefined = undefined;

  public static GizmoOnly = 'GizmoOnly';

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get renderStyle(): SolidPrimitiveRenderStyle {
    return this.getRenderStyle() as SolidPrimitiveRenderStyle;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  protected constructor() {
    super();
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get icon(): IconName {
    return getIconByPrimitiveType(this.primitiveType);
  }

  public override createTransaction(changed: symbol): Transaction {
    return new DomainObjectTransaction(this, changed);
  }

  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  public override setFocusInteractive(focusType: FocusType, focusFace?: BoxFace): boolean {
    const changedFromPending =
      this.focusType === FocusType.Pending && focusType !== FocusType.Pending;
    if (focusType === FocusType.None) {
      if (this.focusType === FocusType.None) {
        return false; // No change
      }
      this.focusType = FocusType.None;
      this.focusFace = undefined; // Ignore input face
    } else {
      if (focusType === this.focusType && BoxFace.equals(this.focusFace, focusFace)) {
        return false; // No change
      }
      this.focusType = focusType;
      this.focusFace = focusFace;
    }
    this.notify(Changes.focus);
    if (changedFromPending) {
      this.notify(Changes.geometry);
    }
    return true;
  }

  // ==================================================
  // VIRTUAL METHODS (To be overridden)
  // ==================================================

  public abstract get primitiveType(): PrimitiveType;

  public clear(): void {
    this.focusType = FocusType.None;
    this.focusFace = undefined;
  }
}
