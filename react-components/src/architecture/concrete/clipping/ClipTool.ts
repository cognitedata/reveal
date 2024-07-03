/*!
 * Copyright 2024 Cognite AS
 */

import { type BaseCommand } from '../../base/commands/BaseCommand';
import { type BaseCreator } from '../../base/domainObjectsHelpers/BaseCreator';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { PrimitiveEditTool } from '../primitives/PrimitiveEditTool';
import { PrimitiveType } from '../primitives/PrimitiveType';
import { BoxCreator } from '../primitives/box/BoxCreator';
import { CropBoxDomainObject } from './CropBoxDomainObject';
import { ApplyClipCommand } from './commands/ApplyClipCommand';
import { ShowClippingOnTopCommand } from './commands/ShowClippingOnTopCommand';
import { ShowAllClippingCommand } from './commands/ShowAllClippingCommand';
import { type VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { SetClipTypeCommand } from './commands/SetClipTypeCommand';
import { PlaneCreator } from '../primitives/plane/PlaneCreator';
import { SliceDomainObject } from './SliceDomainObject';
import { UndoCommand } from '../../base/concreteCommands/UndoCommand';
import { NextOrPrevClippingCommand } from './commands/NextClippingCommand';
import { IconName } from '../../../components/Architecture/getIconComponent';

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

  public override get tooltip(): TranslateKey {
    return { key: 'CLIP_TOOL', fallback: 'Create or edit crop box and slice planes' };
  }

  public override getToolbar(): Array<BaseCommand | undefined> {
    return [
      new SetClipTypeCommand(PrimitiveType.PlaneX),
      new SetClipTypeCommand(PrimitiveType.PlaneY),
      new SetClipTypeCommand(PrimitiveType.PlaneZ),
      new SetClipTypeCommand(PrimitiveType.PlaneXY),
      new SetClipTypeCommand(PrimitiveType.Box),
      undefined, // Separator
      new UndoCommand(),
      new ApplyClipCommand(),
      new NextOrPrevClippingCommand(false),
      new NextOrPrevClippingCommand(true),
      new ShowAllClippingCommand(),
      new ShowClippingOnTopCommand()
    ];
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
  // OVERRIDES of BoxOrLineEditTool
  // ==================================================

  protected override createCreator(): BaseCreator | undefined {
    switch (this.primitiveType) {
      case PrimitiveType.PlaneX:
      case PrimitiveType.PlaneY:
      case PrimitiveType.PlaneZ:
      case PrimitiveType.PlaneXY:
        return new PlaneCreator(this, new SliceDomainObject(this.primitiveType));

      case PrimitiveType.Box:
        return new BoxCreator(this, new CropBoxDomainObject());
      default:
        return undefined;
    }
  }
}
