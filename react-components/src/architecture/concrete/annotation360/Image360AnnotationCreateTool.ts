/*!
 * Copyright 2024 Cognite AS
 */

import { type BaseCreator } from '../../base/domainObjectsHelpers/BaseCreator';
import { type TranslationInput } from '../../base/utilities/TranslateInput';
import { PrimitiveEditTool } from '../primitives/tools/PrimitiveEditTool';
import { Image360AnnotationDomainObject } from './Image360AnnotationDomainObject';
import { type VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { type IconName } from '../../base/utilities/IconName';
import { Image360AnnotationCreator } from './Image360AnnotationCreator';
import { PrimitiveType } from '../../base/utilities/primitives/PrimitiveType';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { Image360AnnotationFolder } from './Image360AnnotationFolder';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { CommandsUpdater } from '../../base/reactUpdaters/CommandsUpdater';
import { Image360AnnotationSelectTool } from './Image360AnnotationSelectTool';
import { type DmsUniqueIdentifier } from '../../../data-providers';
import { type RevealRenderTarget } from '../../base/renderTarget/RevealRenderTarget';
import { type Vector3 } from 'three';
import assert from 'assert';

export class Image360AnnotationCreateTool extends PrimitiveEditTool {
  private readonly _mustBeInside360Image: boolean;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(mustBeInside360Image = true) {
    super(PrimitiveType.Polygon);
    this._mustBeInside360Image = mustBeInside360Image;
  }

  // ==================================================
  // OVERRIDES of BaseCommand
  // ==================================================

  public override get icon(): IconName {
    return 'Polygon';
  }

  public override get tooltip(): TranslationInput {
    return {
      untranslated: 'Create 360 annotation polygons. Click at least 3 points and end with Esc.'
    };
  }

  public override get isEnabled(): boolean {
    return this._mustBeInside360Image ? this.renderTarget.isInside360Image : true;
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

  public override onDeactivate(): void {
    super.onDeactivate();
    this.escape();
  }

  public override onEscapeKey(): void {
    this.escape();
    this.setSelectTool();
  }

  public override async onHover(event: PointerEvent): Promise<void> {
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
    super.onHover(event);
  }

  public override async onHoverByDebounce(_event: PointerEvent): Promise<void> {
    await Promise.resolve();
    // Used by onHover
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    let creator = this._creator;
    if (creator !== undefined) {
      const ray = this.getRay(event);
      if (creator.addPoint(ray)) {
        this.endCreatorIfFinished(creator);
      }
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
    const imageId: DmsUniqueIdentifier | string | undefined = this._mustBeInside360Image
      ? this.renderTarget.active360ImageId
      : 'Dummy';
    assert(imageId !== undefined, 'Image360AnnotationCreator: image360Id is undefined');

    const domainObject = new Image360AnnotationDomainObject(imageId);
    domainObject.center.copy(getCameraPositionInCDFCoordinates(this.renderTarget));
    return new Image360AnnotationCreator(domainObject);

    function getCameraPositionInCDFCoordinates(renderTarget: RevealRenderTarget): Vector3 {
      // Get the camera position in CDF coordinates
      const { position } = renderTarget.cameraManager.getCameraState();
      assert(position !== undefined, 'Camera position unknown');

      const center = position.clone();
      return center.applyMatrix4(renderTarget.fromViewerMatrix);
    }
  }

  protected override getOrCreateParent(): DomainObject {
    const root = this.rootDomainObject;
    const folder = root.getDescendantByType(Image360AnnotationFolder);
    if (folder !== undefined) {
      return folder;
    }
    const newFolder = new Image360AnnotationFolder();
    newFolder.isExpanded = true;
    root.addChildInteractive(newFolder);
    return newFolder;
  }

  // ==================================================
  // OVERRIDES of PrimitiveEditTool
  // ==================================================

  private setSelectTool(): void {
    if (this.renderTarget.commandsController.setActiveToolByType(Image360AnnotationSelectTool)) {
      CommandsUpdater.update(this.renderTarget);
    }
  }
}
