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
import { UndoCommand } from '../../../base/concreteCommands/UndoCommand';
import { type BaseCommand } from '../../../base/commands/BaseCommand';
import { AnnotationsCreateMockCommand } from './AnnotationsCreateMockCommand';
import { type BaseDragger } from '../../../base/domainObjectsHelpers/BaseDragger';
import { type PrimitivePickInfo } from '../../primitives/common/PrimitivePickInfo';
import { AnnotationsDeleteCommand } from './AnnotationsDeleteCommand';
import { AlignSelectedAnnotationCommand } from './AnnotationsAlignCommand';
import { AnnotationsCreateTool } from './AnnotationsCreateTool';
import { type AnnotationIntersectInfo } from '../helpers/getClosestAnnotation';
import { SolidDomainObject } from '../../primitives/common/SolidDomainObject';
import { isAnnotationsOrGizmo, isGizmo } from './isGizmo';

export const ANNOTATION_RADIUS_FACTOR = 0.2;

export class AnnotationsSelectTool extends BaseEditTool {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super();
  }

  // ==================================================
  // OVERRIDES of BaseCommand
  // ==================================================

  public override get icon(): string {
    return 'Cursor';
  }

  public override get tooltip(): TranslateKey {
    return { key: 'ANNOTATIONS_EDIT', fallback: 'Edit annotations' };
  }

  // ==================================================
  // OVERRIDES of BaseTool
  // ==================================================

  public override onActivate(): void {
    super.onActivate();
    const domainObject = this.getSelectedAnnotationsDomainObject();
    if (domainObject === undefined) {
      return undefined;
    }
    domainObject.setVisibleInteractive(true, this.renderTarget);
  }

  public override onDeactivate(): void {
    super.onDeactivate();
    for (const domainObject of this.rootDomainObject.getDescendantsByType(
      AnnotationsDomainObject
    )) {
      domainObject.removeGizmoInteractive();
    }
  }

  public override onDeleteKey(): void {
    const domainObject = this.getSelectedAnnotationsDomainObject();
    if (domainObject !== undefined) {
      // this.addTransaction(domainObject.createTransaction(Changes.deleted));
      domainObject.removeSelectedAnnotationInteractive();
    }
  }

  public override onEscapeKey(): void {
    this.deselectedAnnotationInteractive();
  }

  public override async onHover(event: PointerEvent): Promise<void> {
    const intersection = this.getSpecificIntersection(event, isAnnotationsOrGizmo);
    const domainObject = AnnotationsSelectTool.getIntersectedAnnotationsDomainObject(intersection);
    const intersectInfo = getIntersectedAnnotation(intersection);
    const gizmo = getIntersectedAnnotationGizmo(intersection);

    if (domainObject !== undefined && intersectInfo !== undefined) {
      this.renderTarget.setDefaultCursor();
      if (intersectInfo.annotation === domainObject.selectedAnnotation) {
        domainObject.setFocusAnnotationInteractive(FocusType.None);
      } else {
        domainObject.setFocusAnnotationInteractive(FocusType.Focus, intersectInfo.annotation);
      }
    } else if (gizmo === undefined) {
      this.renderTarget.setNavigateCursor();
      this.defocusAll();
    } else if (gizmo !== undefined && isDomainObjectIntersection(intersection)) {
      this.defocusAll();
      const pickInfo = intersection.userData as PrimitivePickInfo;
      gizmo.setFocusInteractive(pickInfo.focusType, pickInfo.face);
      this.renderTarget.cursor = gizmo.getEditToolCursor(this.renderTarget, intersection.point);
    }
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    const intersection = await this.getIntersection(event);
    const domainObject = AnnotationsSelectTool.getIntersectedAnnotationsDomainObject(intersection);
    const intersectInfo = getIntersectedAnnotation(intersection);
    const gizmo = getIntersectedAnnotationGizmo(intersection);

    if (domainObject !== undefined && intersectInfo !== undefined) {
      // Click at an annotation
      domainObject.setSelectedAnnotationInteractive(
        intersectInfo.annotation,
        intersectInfo.primitiveIndex
      );
      return;
    } else if (domainObject !== undefined) {
      // This will rather ont happen
      domainObject.setSelectedAnnotationInteractive(undefined);
    } else if (gizmo === undefined) {
      // Click in the "air"
      this.deselectedAnnotationInteractive();
    }
    await super.onClick(event);
  }

  public override getToolbar(): Array<BaseCommand | undefined> {
    return [
      new AnnotationsCreateTool(),
      new AnnotationsDeleteCommand(),
      new AlignSelectedAnnotationCommand(true),
      new AlignSelectedAnnotationCommand(false),
      new AnnotationsCreateMockCommand(),
      undefined,
      new UndoCommand()
    ];
  }

  protected override async createDragger(event: PointerEvent): Promise<BaseDragger | undefined> {
    const intersection = await this.getIntersection(event, isGizmo);
    if (intersection === undefined) {
      return undefined;
    }
    if (!isDomainObjectIntersection(intersection)) {
      return undefined;
    }
    const gizmo = intersection.domainObject as VisualDomainObject;
    if (!isGizmo(gizmo)) {
      return undefined;
    }
    const ray = this.getRay(event);
    const matrix = CDF_TO_VIEWER_TRANSFORMATION.clone().invert();
    const point = intersection.point.clone();
    point.applyMatrix4(matrix);
    ray.applyMatrix4(matrix);
    return gizmo.createDragger({ intersection, point, ray });
  }

  // ==================================================
  // OVERRIDES of BaseEditTool
  // ==================================================

  protected override deselectAll(_except?: VisualDomainObject | undefined): void {
    // Do nothing here
  }

  protected override canBeSelected(domainObject: VisualDomainObject): boolean {
    return domainObject instanceof AnnotationsDomainObject;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private getSelectedAnnotationsDomainObject(): AnnotationsDomainObject | undefined {
    return this.rootDomainObject.getSelectedDescendantByType(AnnotationsDomainObject);
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

  private deselectedAnnotationInteractive(): void {
    const annotationsDomainObject = this.getSelectedAnnotationsDomainObject();
    if (annotationsDomainObject !== undefined) {
      annotationsDomainObject.setSelectedAnnotationInteractive(undefined);
    }
  }
  // ==================================================
  // STATIC METHODS
  // ==================================================

  public static getIntersectedAnnotationsDomainObject(
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
}

// ==================================================
// PRIVATE FUNCTIONS: Getters for selected objects
// ==================================================

function getIntersectedAnnotation(
  intersection: AnyIntersection | undefined
): AnnotationIntersectInfo | undefined {
  if (intersection === undefined) {
    return undefined;
  }
  if (!isDomainObjectIntersection(intersection)) {
    return undefined;
  }
  return intersection.userData as AnnotationIntersectInfo;
}

function getIntersectedAnnotationGizmo(
  intersection: AnyIntersection | undefined
): SolidDomainObject | undefined {
  if (intersection === undefined) {
    return undefined;
  }
  if (!isDomainObjectIntersection(intersection)) {
    return undefined;
  }
  const { domainObject } = intersection;
  if (!isGizmo(domainObject)) {
    return undefined;
  }
  if (domainObject instanceof SolidDomainObject) {
    return domainObject;
  }
  return undefined;
}
