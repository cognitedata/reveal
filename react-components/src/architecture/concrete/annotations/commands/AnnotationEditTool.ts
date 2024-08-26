/*!
 * Copyright 2024 Cognite AS
 */

import { CDF_TO_VIEWER_TRANSFORMATION, type AnyIntersection } from '@cognite/reveal';
import { type VisualDomainObject } from '../../../base/domainObjects/VisualDomainObject';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { AnnotationsDomainObject } from '../AnnotationsDomainObject';
import { BaseEditTool } from '../../../base/commands/BaseEditTool';
import { isDomainObjectIntersection } from '../../../base/domainObjectsHelpers/DomainObjectIntersection';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { ShowAnnotationsOnTopCommand } from './ShowAnnotationsOnTopCommand';
import { UndoCommand } from '../../../base/concreteCommands/UndoCommand';
import { type BaseCommand } from '../../../base/commands/BaseCommand';
import { ShowAllAnnotationsCommand } from './ShowAllAnnotationsCommand';
import { CreateAnnotationMockCommand } from './CreateAnnotationMockCommand';
import { PrimitiveType } from '../../primitives/PrimitiveType';
import { CommandsUpdater } from '../../../base/reactUpdaters/CommandsUpdater';
import { SetAnnotationEditTypeCommand } from './SetAnnotationEditTypeCommand';
import { type BaseCreator } from '../../../base/domainObjectsHelpers/BaseCreator';
import { BoxCreator } from '../../primitives/box/BoxCreator';
import { AnnotationGizmoDomainObject } from '../AnnotationGizmoDomainObject';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type BaseDragger } from '../../../base/domainObjectsHelpers/BaseDragger';
import { PrimitiveEditTool } from '../../primitives/PrimitiveEditTool';
import { type BoxPickInfo } from '../../../base/utilities/box/BoxPickInfo';
import { getStatusByAnnotation } from '../utils/getStatusByAnnotation';
import { DomainObjectChange } from '../../../base/domainObjectsHelpers/DomainObjectChange';
import { type SingleAnnotation } from '../helpers/SingleAnnotation';
import { DeleteSelectedAnnotationCommand } from './DeleteSelectedAnnotationCommand';
import { AlignSelectedAnnotationCommand } from './AlignSelectedAnnotationCommand';

export const ANNOTATION_RADIUS_FACTOR = 0.2;

export class AnnotationEditTool extends BaseEditTool {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _creator: BaseCreator | undefined = undefined;
  public primitiveType: PrimitiveType;
  public defaultPrimitiveType: PrimitiveType;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(primitiveType: PrimitiveType = PrimitiveType.None) {
    super();
    this.primitiveType = primitiveType;
    this.defaultPrimitiveType = primitiveType;
  }

  // ==================================================
  // OVERRIDES of BaseCommand
  // ==================================================

  public override get icon(): string {
    return 'Edit';
  }

  public override get tooltip(): TranslateKey {
    return { key: 'ANNOTATIONS_EDIT', fallback: 'Create or edit annotations' };
  }

  // ==================================================
  // OVERRIDES of BaseTool
  // ==================================================

  public override onDeactivate(): void {
    this.handleEscape();
    super.onDeactivate();
  }

  public override clearDragging(): void {
    super.clearDragging();
    this._creator = undefined;
  }

  public override onKey(event: KeyboardEvent, down: boolean): void {
    if (down && (event.key === 'Delete' || event.key === 'Backspace')) {
      const domainObject = this.getSelectedAnnotationsDomainObject();
      if (domainObject !== undefined) {
        // this.addTransaction(domainObject.createTransaction(Changes.deleted));
        domainObject.removeSelectedAnnotationInteractive();
      }
      this._creator = undefined;
      return;
    }
    if (down && event.key === 'Escape') {
      this.handleEscape();
    }
    super.onKey(event, down);
  }

  public override async onHover(event: PointerEvent): Promise<void> {
    const ray = this.getRay(event);
    if (this.primitiveType === PrimitiveType.Box) {
      const { _creator: creator } = this;
      if (creator !== undefined) {
        // Hover in the "air"
        if (creator.addPoint(ray, undefined, true)) {
          this.setDefaultCursor();
          return;
        }
        const intersection = await this.getIntersection(event);
        if (intersection === undefined) {
          if (creator !== undefined && creator.preferIntersection) {
            // Hover in the "air"
            const ray = this.getRay(event);
            if (creator.addPoint(ray, undefined, true)) {
              this.setDefaultCursor();
              return;
            }
          }
          this.renderTarget.setNavigateCursor();
          return;
        }
        if (getIntersectedAnnotationsDomainObject(intersection) !== undefined) {
          this.renderTarget.setNavigateCursor();
          return;
        }
        if (creator.addPoint(ray, intersection, true)) {
          this.setDefaultCursor();
          return;
        }
        this.renderTarget.setNavigateCursor();
      } else {
        const intersection = await this.getIntersection(event);
        if (intersection !== undefined) {
          this.renderTarget.setCrosshairCursor();
        } else {
          this.renderTarget.setNavigateCursor();
        }
      }
    } else {
      const intersection = await this.getIntersection(event);
      const domainObject = getIntersectedAnnotationsDomainObject(intersection);
      const annotation = getIntersectedAnnotation(intersection);
      const annotationGizmo = getIntersectedAnnotationGizmo(intersection);

      if (domainObject !== undefined && annotation !== undefined) {
        this.renderTarget.setDefaultCursor();
        if (annotation.equals(domainObject.selectedAnnotation)) {
          domainObject.setFocusAnnotationInteractive(FocusType.None);
        } else {
          domainObject.setFocusAnnotationInteractive(FocusType.Focus, annotation);
        }
      } else if (annotationGizmo === undefined) {
        this.renderTarget.setNavigateCursor();
        this.defocusAll();
      } else if (annotationGizmo !== undefined && isDomainObjectIntersection(intersection)) {
        const pickInfo = intersection.userData as BoxPickInfo;
        annotationGizmo.setFocusInteractive(pickInfo.focusType, pickInfo.face);
        PrimitiveEditTool.setCursor(this, annotationGizmo, intersection.point, pickInfo);
      }
    }
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    const { renderTarget } = this;

    if (this.primitiveType === PrimitiveType.Box) {
      let creator = this._creator;

      // Click in the "air"
      if (creator !== undefined) {
        const ray = this.getRay(event);
        if (creator.addPoint(ray, undefined)) {
          this.endCreatorIfFinished(creator);
          return;
        }
      }
      const intersection = await this.getIntersection(event);
      if (intersection === undefined) {
        // Click in the "air"
        return;
      }
      if (creator !== undefined) {
        const ray = this.getRay(event);
        if (creator.addPoint(ray, intersection)) {
          this.endCreatorIfFinished(creator);
        }
        return;
      }
      if (creator === undefined) {
        creator = this._creator = this.createCreator();
        if (creator === undefined) {
          return;
        }
        this.setDeselectedAnnotationInteractive();
        const ray = this.getRay(event);
        if (creator.addPoint(ray, intersection)) {
          const annotationGizmo = creator.domainObject;
          annotationGizmo.setSelectedInteractive(true);
          annotationGizmo.setVisibleInteractive(true, renderTarget);
          annotationGizmo.notify(Changes.geometry);
          // .addTransaction(domainObject.createTransaction(Changes.added));
        } else {
          this._creator = undefined;
          return;
        }
        this.endCreatorIfFinished(creator);
        return;
      }
      this.renderTarget.setMoveCursor();
    } else {
      const intersection = await this.getIntersection(event);
      const domainObject = getIntersectedAnnotationsDomainObject(intersection);
      const annotation = getIntersectedAnnotation(intersection);
      const annotationGizmo = getIntersectedAnnotationGizmo(intersection);

      if (domainObject !== undefined && annotation !== undefined) {
        this.setSelectedAnnotationInteractive(domainObject, annotation);
      } else if (domainObject !== undefined) {
        this.setSelectedAnnotationInteractive(domainObject, undefined);
      } else if (annotationGizmo === undefined) {
        // Click in the "air"
        this.setDeselectedAnnotationInteractive();
      }
    }
  }

  public override async onLeftPointerDown(event: PointerEvent): Promise<void> {
    if (this._creator !== undefined) {
      return; // Prevent dragging while creating the new
    }
    await super.onLeftPointerDown(event);
  }

  public override getToolbar(): Array<BaseCommand | undefined> {
    return [
      new SetAnnotationEditTypeCommand(PrimitiveType.None),
      new SetAnnotationEditTypeCommand(PrimitiveType.Box),
      undefined,
      new UndoCommand(),
      new DeleteSelectedAnnotationCommand(),
      new AlignSelectedAnnotationCommand(true),
      new AlignSelectedAnnotationCommand(false),
      undefined,
      new CreateAnnotationMockCommand(),
      new ShowAllAnnotationsCommand(),
      new ShowAnnotationsOnTopCommand()
    ];
  }

  protected override async createDragger(event: PointerEvent): Promise<BaseDragger | undefined> {
    function isAnnotationGizmo(domainObject: DomainObject): boolean {
      return domainObject instanceof AnnotationGizmoDomainObject;
    }
    const intersection = await this.getIntersection(event, isAnnotationGizmo);
    if (intersection === undefined) {
      return undefined;
    }
    if (!isDomainObjectIntersection(intersection)) {
      return undefined;
    }
    const annotationGizmo = intersection.domainObject as AnnotationGizmoDomainObject;
    if (annotationGizmo === undefined) {
      return undefined;
    }
    const ray = this.getRay(event);
    const matrix = CDF_TO_VIEWER_TRANSFORMATION.clone().invert();
    const point = intersection.point.clone();
    point.applyMatrix4(matrix);
    ray.applyMatrix4(matrix);
    return annotationGizmo.createDragger({ intersection, point, ray });
  }

  // ==================================================
  // OVERRIDES of BaseEditTool
  // ==================================================

  protected override deselectAll(_except?: VisualDomainObject | undefined): void {
    // Don't want this to ado anything
  }

  protected override canBeSelected(domainObject: VisualDomainObject): boolean {
    return domainObject instanceof AnnotationsDomainObject;
  }

  private createCreator(): BaseCreator | undefined {
    const domainObject = this.getSelectedAnnotationsDomainObject();
    if (domainObject === undefined) {
      return undefined;
    }
    const annotationGizmo = domainObject.getOrCreateAnnotationGizmo();
    annotationGizmo.clear();
    switch (this.primitiveType) {
      case PrimitiveType.Box:
        return new BoxCreator(this, annotationGizmo);
      default:
        return undefined;
    }
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private getSelectedAnnotationsDomainObject(): AnnotationsDomainObject | undefined {
    return this.getSelected() as AnnotationsDomainObject;
  }

  public handleEscape(): void {
    if (this._creator === undefined) {
      return;
    }
    if (this._creator.handleEscape()) {
      this.endCreatorIfFinished(this._creator, true);
    } else {
      this.setDefaultPrimitiveType();
      this._creator = undefined;
    }
  }

  private defocusAll(except?: DomainObject | undefined): void {
    for (const domainObject of this.getSelectable()) {
      if (except !== undefined && domainObject === except) {
        continue;
      }
      if (domainObject instanceof AnnotationsDomainObject) {
        domainObject.setFocusAnnotationInteractive(FocusType.None);
      }
    }
  }

  private setDefaultPrimitiveType(): void {
    if (this.primitiveType === this.defaultPrimitiveType) {
      return;
    }
    this.primitiveType = this.defaultPrimitiveType;
    CommandsUpdater.update(this.renderTarget);
  }

  private endCreatorIfFinished(creator: BaseCreator, force = false): void {
    if (!creator.isFinished && !force) {
      return;
    }
    this.setDefaultPrimitiveType();
    this._creator = undefined;

    const annotationsDomainObject = this.getSelectedAnnotationsDomainObject();
    const annotationGizmo = creator.domainObject as AnnotationGizmoDomainObject;
    if (annotationsDomainObject === undefined || annotationGizmo === undefined) {
      return;
    }
    const newAnnotation = annotationGizmo.createSingleAnnotationBox();
    annotationsDomainObject.annotations.push(newAnnotation.annotation);
    annotationsDomainObject.notify(Changes.geometry);
    annotationsDomainObject.setSelectedAnnotationInteractive(newAnnotation);
  }

  private setDeselectedAnnotationInteractive(): void {
    const annotationsDomainObject = this.getSelectedAnnotationsDomainObject();
    if (annotationsDomainObject !== undefined) {
      this.setSelectedAnnotationInteractive(annotationsDomainObject, undefined);
    }
  }

  private setSelectedAnnotationInteractive(
    annotationsDomainObject: AnnotationsDomainObject,
    annotation: SingleAnnotation | undefined
  ): void {
    if (annotation === undefined) {
      annotationsDomainObject.setSelectedAnnotationInteractive(undefined);
      const annotationGizmo = annotationsDomainObject.getAnnotationGizmo();
      if (annotationGizmo !== undefined) {
        annotationGizmo.setVisibleInteractive(false, this.renderTarget);
      }
      return;
    }
    const annotationGizmo = annotationsDomainObject.getOrCreateAnnotationGizmo();
    if (!annotationGizmo.updateThisFromAnnotation(annotation)) {
      return;
    }
    if (!annotationsDomainObject.setSelectedAnnotationInteractive(annotation)) {
      return;
    }
    annotationGizmo.color.set(
      annotationsDomainObject.style.getColorByStatus(getStatusByAnnotation(annotation.annotation))
    );

    const change = new DomainObjectChange();
    change.addChange(Changes.geometry);
    change.addChange(Changes.color);

    // This little "hack" disables the update up the AnnotationsDomainObject
    annotationsDomainObject.selectedAnnotation = undefined;
    annotationGizmo.notify(change);
    annotationsDomainObject.selectedAnnotation = annotation;

    annotationGizmo.setFocusInteractive(FocusType.Body);
    annotationGizmo.setSelectedInteractive(true);
    annotationGizmo.setVisibleInteractive(true, this.renderTarget);
  }
}

// ==================================================
// PRIVATE FUNCTIONS: Getters for selected objects
// ==================================================

function getIntersectedAnnotation(
  intersection: AnyIntersection | undefined
): SingleAnnotation | undefined {
  if (intersection === undefined) {
    return undefined;
  }
  if (!isDomainObjectIntersection(intersection)) {
    return undefined;
  }
  return intersection.userData as SingleAnnotation;
}

function getIntersectedAnnotationsDomainObject(
  intersection: AnyIntersection | undefined
): AnnotationsDomainObject | undefined {
  if (intersection === undefined) {
    return undefined;
  }
  if (!isDomainObjectIntersection(intersection)) {
    return undefined;
  }
  const { domainObject } = intersection;
  if (!(domainObject instanceof AnnotationsDomainObject)) {
    return undefined;
  }
  return domainObject;
}

function getIntersectedAnnotationGizmo(
  intersection: AnyIntersection | undefined
): AnnotationGizmoDomainObject | undefined {
  if (intersection === undefined) {
    return undefined;
  }
  if (!isDomainObjectIntersection(intersection)) {
    return undefined;
  }
  const { domainObject } = intersection;
  if (!(domainObject instanceof AnnotationGizmoDomainObject)) {
    return undefined;
  }
  return domainObject;
}
