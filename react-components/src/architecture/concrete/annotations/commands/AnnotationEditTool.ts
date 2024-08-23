/*!
 * Copyright 2024 Cognite AS
 */

import { CDF_TO_VIEWER_TRANSFORMATION, type AnyIntersection } from '@cognite/reveal';
import { type VisualDomainObject } from '../../../base/domainObjects/VisualDomainObject';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { AnnotationsDomainObject } from '../AnnotationsDomainObject';
import { BaseEditTool } from '../../../base/commands/BaseEditTool';
import { isDomainObjectIntersection } from '../../../base/domainObjectsHelpers/DomainObjectIntersection';
import { type PointCloudAnnotation } from '../utils/types';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { ShowAnnotationsOnTopCommand } from './ShowAnnotationsOnTopCommand';
import { UndoCommand } from '../../../base/concreteCommands/UndoCommand';
import { type BaseCommand } from '../../../base/commands/BaseCommand';
import { ShowAllAnnotationsCommand } from './ShowAllAnnotationsCommand';
import {
  CreateAnnotationMockCommand,
  createPointCloudAnnotationFromMatrix
} from './CreateAnnotationMockCommand';
import { PrimitiveType } from '../../primitives/PrimitiveType';
import { CommandsUpdater } from '../../../base/reactUpdaters/CommandsUpdater';
import { SetAnnotationEditTypeCommand } from './SetAnnotationEditTypeCommand';
import { type BaseCreator } from '../../../base/domainObjectsHelpers/BaseCreator';
import { BoxCreator } from '../../primitives/box/BoxCreator';
import { AnnotationGizmoDomainObject } from '../AnnotationGizmoDomainObject';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { getSingleAnnotationGeometry } from '../utils/annotationGeometryUtils';
import { getAnnotationMatrixByGeometry } from '../utils/getMatrixUtils';
import { Color } from 'three';
import { type BaseDragger } from '../../../base/domainObjectsHelpers/BaseDragger';

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
    if (this.primitiveType !== PrimitiveType.None && this._creator !== undefined) {
      const { _creator: creator } = this;
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
      if (getSelectedAnnotationsDomainObject(intersection) !== undefined) {
        this.renderTarget.setNavigateCursor();
        return;
      }
      if (creator.addPoint(ray, intersection, true)) {
        this.setDefaultCursor();
        return;
      }
      this.renderTarget.setNavigateCursor();
      return;
    }
    // ddddd
    const intersection = await this.getIntersection(event);
    const domainObject = getSelectedAnnotationsDomainObject(intersection);
    const annotation = getSelectedAnnotation(intersection);
    if (domainObject !== undefined && annotation !== undefined) {
      this.renderTarget.setMoveCursor();
      domainObject.setFocusAnnotationInteractive(FocusType.Focus, annotation);
    } else if (this.primitiveType !== PrimitiveType.None && intersection !== undefined) {
      this.renderTarget.setCrosshairCursor();
      this.defocusAll();
    } else {
      this.renderTarget.setNavigateCursor();
      this.defocusAll();
    }
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    const { renderTarget } = this;
    let creator = this._creator;

    // Click in the "air"
    if (creator !== undefined && !creator.preferIntersection) {
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
    const domainObject = getSelectedAnnotationsDomainObject(intersection);
    const annotation = getSelectedAnnotation(intersection);
    if (domainObject !== undefined && annotation !== undefined) {
      this.setSelectedAnnotationInteractive(domainObject, annotation);
      return;
    } else if (domainObject !== undefined) {
      this.setSelectedAnnotationInteractive(domainObject, undefined);
    }
    const ray = this.getRay(event);
    if (this.primitiveType !== PrimitiveType.None && creator === undefined) {
      creator = this._creator = this.createCreator();
      if (creator === undefined) {
        return;
      }
      if (creator.addPoint(ray, intersection)) {
        const annotationGizmo = creator.domainObject;
        annotationGizmo.setSelectedInteractive(true);
        annotationGizmo.setVisibleInteractive(true, renderTarget);
        // .addTransaction(domainObject.createTransaction(Changes.added));
      } else {
        this._creator = undefined;
        return;
      }
      this.endCreatorIfFinished(creator);
      return;
    }
    this.renderTarget.setMoveCursor();
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
      new UndoCommand(),
      new CreateAnnotationMockCommand(),
      new ShowAllAnnotationsCommand(),
      new ShowAnnotationsOnTopCommand()
    ];
  }

  protected override async createDragger(event: PointerEvent): Promise<BaseDragger | undefined> {
    const intersection = await this.getIntersection(event);
    if (intersection === undefined) {
      return undefined;
    }
    if (!isDomainObjectIntersection(intersection)) {
      return undefined;
    }
    const domainObject = intersection.domainObject;
    let annotationGizmo: AnnotationGizmoDomainObject;
    if (domainObject instanceof AnnotationsDomainObject) {
      annotationGizmo = domainObject.getOrCreateAnnotationGizmo();
    } else if (domainObject instanceof AnnotationGizmoDomainObject) {
      annotationGizmo = domainObject;
    } else {
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

  protected override canBeSelected(domainObject: VisualDomainObject): boolean {
    return domainObject instanceof AnnotationsDomainObject;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

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

  protected getSelectedAnnotationsDomainObject(): AnnotationsDomainObject | undefined {
    return this.getSelected() as AnnotationsDomainObject;
  }

  public handleEscape(): void {
    // if (this._creator === undefined) {
    //   return;
    // }
    // if (this._creator.handleEscape()) {
    //   this.endCreatorIfFinished(this._creator, true);
    // } else {
    //   this.setDefaultPrimitiveType();
    //   this._creator = undefined;
    // }
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
    if (!force && !creator.isFinished) {
      return;
    }
    const annotationsDomainObject = this.getSelectedAnnotationsDomainObject();
    const annotationGizmo = creator.domainObject as AnnotationGizmoDomainObject;
    if (annotationsDomainObject !== undefined && annotationGizmo !== undefined) {
      const matrix = annotationGizmo.getMatrixForAnnotation();
      const newAnnotation = createPointCloudAnnotationFromMatrix(matrix);
      annotationsDomainObject.annotations.push(newAnnotation);
      annotationsDomainObject.notify(Changes.geometry);
      this.setSelectedAnnotationInteractive(annotationsDomainObject, newAnnotation);
    }
    this.setDefaultPrimitiveType();
    this._creator = undefined;
  }

  private setSelectedAnnotationInteractive(
    annotationsDomainObject: AnnotationsDomainObject,
    annotation: PointCloudAnnotation | undefined
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
    const geometry = getSingleAnnotationGeometry(annotation);
    if (geometry === undefined) {
      return;
    }
    const matrix = getAnnotationMatrixByGeometry(geometry);
    if (matrix === undefined) {
      return;
    }
    if (!annotationsDomainObject.setSelectedAnnotationInteractive(annotation)) {
      return;
    }
    annotationsDomainObject.setFocusAnnotationInteractive(FocusType.None);
    annotationGizmo.setVisibleInteractive(false, this.renderTarget);
    annotationGizmo.color.set(Color.NAMES.blue);
    annotationGizmo.setMatrixFromAnnotation(matrix);
    annotationGizmo.setFocusInteractive(FocusType.Body);
    annotationGizmo.setSelectedInteractive(true);
    annotationGizmo.notify(Changes.geometry);
    annotationGizmo.setVisibleInteractive(true, this.renderTarget);
  }
}

// ==================================================
// PRIVATE FUNCTIONS
// ==================================================

function getSelectedAnnotation(
  intersection: AnyIntersection | undefined
): PointCloudAnnotation | undefined {
  if (intersection === undefined) {
    return undefined;
  }
  if (!isDomainObjectIntersection(intersection)) {
    return undefined;
  }
  return intersection.userData as PointCloudAnnotation;
}

function getSelectedAnnotationsDomainObject(
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
