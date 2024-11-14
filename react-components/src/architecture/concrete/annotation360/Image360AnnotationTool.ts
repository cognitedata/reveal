/*!
 * Copyright 2024 Cognite AS
 */

import { type BaseCreator } from '../../base/domainObjectsHelpers/BaseCreator';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { PrimitiveEditTool } from '../primitives/tools/PrimitiveEditTool';
import { Image360AnnotationDomainObject } from './Image360AnnotationDomainObject';
import { type VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { type IconName } from '../../base/utilities/IconName';
import { Image360AnnotationCreator } from './Image360AnnotationCreator';
import { PrimitiveType } from '../../base/utilities/primitives/PrimitiveType';
import { Image360AnnotationEditTypeCommand } from './Image360AnnotationEditTypeCommand';
import { UndoCommand } from '../../base/concreteCommands/UndoCommand';
import { type BaseCommand } from '../../base/commands/BaseCommand';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { DeleteSelectedImage360AnnotationCommand } from './DeleteSelectedImage360AnnotationCommand';

export class Image360AnnotationTool extends PrimitiveEditTool {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super();
    this.primitiveType = PrimitiveType.Polygon;
  }

  // ==================================================
  // OVERRIDES of BaseCommand
  // ==================================================

  public override get icon(): IconName {
    return 'Polygon';
  }

  public override get tooltip(): TranslateKey {
    return { fallback: 'Create or delete annotation polygon' };
  }

  public override get isEnabled(): boolean {
    return this.renderTarget.isInside360Image;
  }

  public override getToolbar(): Array<BaseCommand | undefined> {
    return [
      new Image360AnnotationEditTypeCommand(PrimitiveType.None),
      new Image360AnnotationEditTypeCommand(PrimitiveType.Polygon),
      undefined, // Separator
      new DeleteSelectedImage360AnnotationCommand(),
      new UndoCommand()
    ];
  }

  public override update(): void {
    super.update();
    if (this.isChecked && !this.isEnabled) {
      this.renderTarget.commandsController.activateDefaultTool();
    }
  }

  // ==================================================
  // OVERRIDES of BaseTool
  // ==================================================

  public override onActivate(): void {
    const selected360ImageId = this.renderTarget.viewer.getActive360ImageInfo()?.image360.id;
    if (selected360ImageId === undefined) {
      return;
    }

    for (const domainObject of this.getSelectable()) {
      if (
        domainObject instanceof Image360AnnotationDomainObject &&
        domainObject.connectedImageId === selected360ImageId
      ) {
        domainObject.setVisibleInteractive(true, this.renderTarget);
      }
    }
    super.onActivate();
  }

  public override onDeactivate(): void {
    this.setAllVisible(false);
    super.onDeactivate();
  }

  public override async onHover(event: PointerEvent): Promise<void> {
    if (!this.isEdit) {
      const creator = this._creator;
      if (creator === undefined) {
        this.setDefaultCursor();
        return;
      }
      // Hover in the "air"
      const ray = this.getRay(event);
      if (creator.addPoint(ray, undefined, true)) {
        this.setDefaultCursor();
        return;
      }
    }
    super.onHover(event);
  }

  public override async onHoverByDebounce(event: PointerEvent): Promise<void> {
    if (!this.isEdit) {
      return; // Used by onHover
    }
    await super.onHoverByDebounce(event);
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    if (!this.isEdit) {
      let creator = this._creator;
      if (creator !== undefined) {
        const ray = this.getRay(event);
        if (creator.addPoint(ray)) {
          this.endCreatorIfFinished(creator);
        }
        return;
      } else {
        creator = this.createCreator();
        if (creator === undefined) {
          await super.onClick(event);
          return;
        }
        const ray = this.getRay(event);
        if (!creator.addPoint(ray)) {
          return;
        }
        const { domainObject } = creator;
        this.deselectAll();

        const parent = this.getOrCreateParent();
        parent.addChildInteractive(domainObject);
        domainObject.setSelectedInteractive(true);
        domainObject.setVisibleInteractive(true);
        this.addTransaction(domainObject.createTransaction(Changes.added));
        this._creator = creator;
      }
    }
    await super.onClick(event);
  }

  // ==================================================
  // OVERRIDES of BaseEditTool
  // ==================================================

  protected override canBeSelected(domainObject: VisualDomainObject): boolean {
    return domainObject instanceof Image360AnnotationDomainObject;
  }

  // ==================================================
  // OVERRIDES of PrimitiveEditTool
  // ==================================================

  protected override createCreator(): BaseCreator | undefined {
    return new Image360AnnotationCreator(this);
  }
}
