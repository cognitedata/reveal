/*!
 * Copyright 2024 Cognite AS
 */

import { type BaseCreator } from '../../base/domainObjectsHelpers/BaseCreator';
import { type TranslationInput } from '../../base/utilities/TranslateInput';
import { PrimitiveEditTool } from '../primitives/tools/PrimitiveEditTool';
import { PrimitiveType } from '../../base/utilities/primitives/PrimitiveType';
import { BoxCreator } from '../primitives/box/BoxCreator';
import { CropBoxDomainObject } from './CropBoxDomainObject';
import { type VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { PlaneCreator } from '../primitives/plane/PlaneCreator';
import { SliceDomainObject } from './SliceDomainObject';
import { type IconName } from '../../base/utilities/IconName';
import { ClipFolder } from './ClipFolder';
import { type DomainObject } from '../../base/domainObjects/DomainObject';

export class ClipTool extends PrimitiveEditTool {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super(PrimitiveType.None);
  }

  // ==================================================
  // OVERRIDES of BaseCommand
  // ==================================================

  public override get icon(): IconName {
    return 'Crop';
  }

  public override get tooltip(): TranslationInput {
    return { key: 'CLIP_TOOL' };
  }

  // ==================================================
  // OVERRIDES of BaseTool
  // ==================================================

  public override onActivate(): void {
    super.onActivate();
    this.setAllVisible(true);
  }

  public override onDeactivate(): void {
    super.onDeactivate();
    this.setAllVisible(false);
  }

  // ==================================================
  // OVERRIDES of BaseEditTool
  // ==================================================

  protected override canBeSelected(domainObject: VisualDomainObject): boolean {
    return domainObject instanceof CropBoxDomainObject || domainObject instanceof SliceDomainObject;
  }

  // ==================================================
  // OVERRIDES of PrimitiveEditTool
  // ==================================================

  protected override getOrCreateParent(): DomainObject {
    const parent = this.rootDomainObject.getDescendantByType(ClipFolder);
    if (parent !== undefined) {
      return parent;
    }
    const newParent = new ClipFolder();
    newParent.isExpanded = true;
    this.renderTarget.rootDomainObject.addChildInteractive(newParent);
    return newParent;
  }

  protected override createCreator(): BaseCreator | undefined {
    switch (this.primitiveType) {
      case PrimitiveType.PlaneX:
      case PrimitiveType.PlaneY:
      case PrimitiveType.PlaneZ:
      case PrimitiveType.PlaneXY:
        return new PlaneCreator(new SliceDomainObject(this.primitiveType));

      case PrimitiveType.Box:
        return new BoxCreator(new CropBoxDomainObject());
      default:
        return undefined;
    }
  }
}
