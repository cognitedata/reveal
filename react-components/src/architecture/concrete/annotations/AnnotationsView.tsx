/*!
 * Copyright 2024 Cognite AS
 */

import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe.js';
import {
  CDF_TO_VIEWER_TRANSFORMATION,
  type CustomObjectIntersectInput,
  type CustomObjectIntersection
} from '@cognite/reveal';
import { type PointCloudAnnotation } from './utils/types';
import {
  type CreateWireframeArgs,
  createWireframeFromMultipleAnnotations
} from './utils/createWireframeFromMultipleAnnotations';
import { expandBoundingBox, getBoundingBox } from './utils/getBoundingBox';
import { getClosestAnnotation } from './utils/getClosestAnnotation';
import { getAnnotationMatrixByGeometry } from './helpers/getMatrixUtils';
import { type WireframeUserData } from './helpers/WireframeUserData';
import { GroupThreeView } from '../../base/views/GroupThreeView';
import { type AnnotationsDomainObject } from './AnnotationsDomainObject';
import { type AnnotationsRenderStyle } from './AnnotationsRenderStyle';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type DomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';
import { SingleAnnotation } from './helpers/SingleAnnotation';
import { Box3, Group, Matrix4, Mesh, MeshBasicMaterial, type Object3D, Vector2 } from 'three';
import { CylinderUtils } from '../../base/utilities/box/CylinderUtils';
import { BoxUtils } from '../../base/utilities/box/BoxUtils';
import { AnnotationChangedDescription } from './helpers/AnnotationChangedDescription';
import { ALL_STATUSES, getStatusByAnnotation, Status } from './helpers/Status';

const FOCUS_ANNOTATION_NAME = 'focus-annotation-name';
const GROUP_SIZE = 100;

export class AnnotationsView extends GroupThreeView<AnnotationsDomainObject> {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  // All needed materials
  private readonly contextLineMaterial: LineMaterial;
  private readonly approvedLineMaterial: LineMaterial;
  private readonly suggestedLineMaterial: LineMaterial;
  private readonly rejectedLineMaterial: LineMaterial;

  private readonly contextSelectedLineMaterial: LineMaterial;
  private readonly approvedSelectedLineMaterial: LineMaterial;
  private readonly suggestedSelectedLineMaterial: LineMaterial;
  private readonly rejectedSelectedLineMaterial: LineMaterial;

  private readonly focusAnnotationMaterial: MeshBasicMaterial;

  // This is the only child of the root, annotations are added here
  // When show(hide) annotation I connect/disconnect the child-parent relation between this and the root.
  // Then this functionality doesn't change anything else in the system
  private readonly globalMatrix = new Matrix4();

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  protected override get style(): AnnotationsRenderStyle {
    return super.style as AnnotationsRenderStyle;
  }

  // ==================================================
  // CONSTRUCTORS
  // ==================================================

  constructor() {
    super();

    this.globalMatrix = CDF_TO_VIEWER_TRANSFORMATION.clone();

    this.contextLineMaterial = createLineMaterial();
    this.approvedLineMaterial = createLineMaterial();
    this.suggestedLineMaterial = createLineMaterial();
    this.rejectedLineMaterial = createLineMaterial();

    this.contextSelectedLineMaterial = createLineMaterial();
    this.approvedSelectedLineMaterial = createLineMaterial();
    this.suggestedSelectedLineMaterial = createLineMaterial();
    this.rejectedSelectedLineMaterial = createLineMaterial();

    this.focusAnnotationMaterial = new MeshBasicMaterial();
  }

  // ==================================================
  // OVERRIDES of BaseView
  // ==================================================

  public override update(change: DomainObjectChange): void {
    super.update(change);
    if (change.isChanged(Changes.clipping)) {
      this.clearMemory();
      this.invalidateRenderTarget();
    }
    if (change.isChanged(Changes.renderStyle)) {
      this.updateRenderStyle();
      this.invalidateRenderTarget();
    }
    if (change.isChanged(Changes.selected)) {
      this.updateSelectedAnnotation();
      this.invalidateRenderTarget();
    }
    if (change.isChanged(Changes.focus)) {
      this.updateFocusAnnotation();
      this.invalidateRenderTarget();
    }
    const changedDesc = change.getChangedDescriptionByType(AnnotationChangedDescription);

    if (changedDesc !== undefined) {
      if (changedDesc.change === Changes.addedPart) {
        this.removeChildren();
        this.invalidateRenderTarget();
      } else {
        const annotation = changedDesc.annotation;
        for (const wireframe of this.getWireframes()) {
          const userData = getUserData(wireframe);
          if (userData === undefined) {
            continue;
          }
          if (userData.isPending) {
            continue;
          }
          if (!userData.includes(annotation.annotation)) {
            continue;
          }
          const remainingAnnotations =
            changedDesc.change === Changes.deletedPart
              ? userData.annotations.filter((a) => a !== annotation.annotation)
              : userData.annotations;

          this.addWireframeFromMultipleAnnotations({
            annotations: remainingAnnotations,
            globalMatrix: this.globalMatrix,
            status: userData.status,
            selected: userData.selected,
            startIndex: 0
          });
          this._group.remove(wireframe);
          dispose(wireframe);
          this.invalidateRenderTarget();
          break;
        }
      }
    }
  }

  // ==================================================
  // OVERRIDES of GroupThreeView
  // ==================================================

  public override get useDepthTest(): boolean {
    return this.style.depthTest;
  }

  protected override calculateBoundingBox(): Box3 {
    const annotations = this.domainObject.annotations;
    const boundingBox = new Box3().makeEmpty();
    for (const annotation of annotations) {
      expandBoundingBox(boundingBox, annotation, this.globalMatrix);
    }
    return boundingBox;
  }

  protected override addChildren(): void {
    const { domainObject } = this;

    this.updateRenderStyle();
    const annotations = domainObject.annotations;
    if (annotations === undefined) {
      return;
    }

    for (const status of ALL_STATUSES) {
      const filteredAnnotation = annotations.filter(
        (annotation) => getStatusByAnnotation(annotation) === status
      );
      for (let startIndex = 0; startIndex < filteredAnnotation.length; startIndex += GROUP_SIZE) {
        this.addWireframeFromMultipleAnnotations({
          annotations: filteredAnnotation,
          globalMatrix: this.globalMatrix,
          status,
          selected: false,
          startIndex,
          groupSize: GROUP_SIZE
        });
      }
    }
    // Update the others
    this.updateSelectedAnnotation();
    this.updateFocusAnnotation();
  }

  override intersectIfCloser(
    intersectInput: CustomObjectIntersectInput,
    closestDistance: number | undefined
  ): undefined | CustomObjectIntersection {
    const { domainObject } = this;
    const closestFinder = getClosestAnnotation(
      this.getAnnotations(),
      this.globalMatrix,
      intersectInput.raycaster.ray
    );
    const info = closestFinder.getClosestGeometry();
    if (info === undefined) {
      return undefined;
    }
    if (closestDistance !== undefined && closestFinder.minDistance > closestDistance) {
      return undefined;
    }
    const customObjectIntersection: DomainObjectIntersection = {
      type: 'customObject',
      distanceToCamera: closestFinder.minDistance,
      point: info.point,
      customObject: this,
      domainObject,
      boundingBox: getBoundingBox(info.annotation, this.globalMatrix),
      userData: new SingleAnnotation(info.annotation, info.geometry)
    };
    return customObjectIntersection;
  }

  // ==================================================
  // INSTANCE METHODS: Selected annotation
  // ==================================================

  private updateSelectedAnnotation(): void {
    const annotation = this.domainObject.selectedAnnotation;
    if (annotation === undefined) {
      this.clearSelectedAnnotation();
    } else {
      this.styleAnnotation(annotation, true);
    }
  }

  private clearSelectedAnnotation(): void {
    for (const wireframe of this.getWireframes()) {
      this.styleWireframe(wireframe, false);
    }
  }

  // ==================================================
  // INSTANCE METHODS: Focus Annotation
  // ==================================================

  private updateFocusAnnotation(): void {
    const focusAnnotation = this.domainObject.focusAnnotation;
    this.clearFocusAnnotation();
    if (focusAnnotation === undefined) {
      return;
    }
    const selectedAnnotation = this.domainObject.selectedAnnotation;
    const selectedGeometry = selectedAnnotation?.geometry;

    const group = new Group();
    group.name = FOCUS_ANNOTATION_NAME;
    this.addChild(group);

    for (const geometry of focusAnnotation.getGeometries()) {
      if (selectedGeometry !== undefined && selectedGeometry === geometry) {
        continue;
      }
      const matrix = getAnnotationMatrixByGeometry(geometry);
      if (matrix === undefined) {
        continue;
      }
      matrix.premultiply(this.globalMatrix);
      const isCylinder = geometry.cylinder !== undefined;
      const mesh = createMeshByMatrix(matrix, this.focusAnnotationMaterial, isCylinder);
      group.add(mesh);
    }
  }

  private clearFocusAnnotation(): void {
    const group = this._group.getObjectByName(FOCUS_ANNOTATION_NAME);
    if (group === undefined) {
      return;
    }
    this._group.remove(group);
    dispose(group);
  }

  // ==================================================
  // INSTANCE METHODS: Style annotation
  // ==================================================

  private updateRenderStyle(): void {
    const { style } = this;

    for (const status of ALL_STATUSES) {
      this.setStyle(style, status, false);
      this.setStyle(style, status, true);
    }
    this.focusAnnotationMaterial.color.set(style.blankColor);
    this.focusAnnotationMaterial.transparent = true;
    this.focusAnnotationMaterial.opacity = style.blankOpacity;
    this.focusAnnotationMaterial.depthTest = true;
  }

  private styleWireframe(wireframe: Wireframe, selected: boolean): void {
    const userData = getUserData(wireframe);
    if (userData === undefined) {
      return;
    }
    userData.selected = selected;
    wireframe.material = this.getLineMaterial(userData.status, selected);
  }

  private styleAnnotation(annotation: SingleAnnotation, selected: boolean): void {
    let wireframeToSplit: Wireframe | undefined;
    for (const wireframe of this.getWireframes()) {
      const userData = getUserData(wireframe);
      if (userData === undefined) {
        continue;
      }
      if (userData.isPending) {
        continue;
      }
      if (!userData.includes(annotation.annotation)) {
        this.styleWireframe(wireframe, false);
      } else if (userData.length === 1) {
        this.styleWireframe(wireframe, selected);
      } else {
        wireframeToSplit = wireframe;
      }
    }
    if (wireframeToSplit !== undefined) {
      const userData = getUserData(wireframeToSplit);
      const remainingAnnotations = userData.annotations.filter((a) => a !== annotation.annotation);
      this.addWireframeFromMultipleAnnotations({
        annotations: remainingAnnotations,
        globalMatrix: this.globalMatrix,
        status: userData.status,
        selected: userData.selected,
        startIndex: 0
      });
      const changingAnnotations = [annotation.annotation];
      if (changingAnnotations.length > 0) {
        this.addWireframeFromMultipleAnnotations({
          annotations: changingAnnotations,
          globalMatrix: this.globalMatrix,
          status: userData.status,
          selected,
          startIndex: 0
        });
      }
      this._group.remove(wireframeToSplit);
      dispose(wireframeToSplit);
    }
  }

  // ==================================================
  // INSTANCE METHODS: Misc
  // ==================================================

  private *getWireframes(): Generator<Wireframe> {
    for (const wireframe of getAllWireframes(this._group)) {
      yield wireframe;
    }
  }

  private *getAnnotations(): Generator<PointCloudAnnotation> {
    for (const wireframe of this.getWireframes()) {
      const userData = getUserData(wireframe);
      if (userData === undefined) {
        continue;
      }
      if (userData.isPending) {
        continue;
      }
      for (const annotation of userData.annotations) {
        yield annotation;
      }
    }
  }

  // ==================================================
  // INSTANCE METHODS: Get Material
  // ==================================================

  private getLineMaterial(status: Status, selected: boolean): LineMaterial {
    switch (selected) {
      case true:
        switch (status) {
          case Status.Contextualized:
            return this.contextSelectedLineMaterial;
          case Status.Approved:
            return this.approvedSelectedLineMaterial;
          case Status.Suggested:
            return this.suggestedSelectedLineMaterial;
          case Status.Rejected:
            return this.rejectedSelectedLineMaterial;
          default:
            return this.suggestedSelectedLineMaterial;
        }
      case false:
        switch (status) {
          case Status.Contextualized:
            return this.contextLineMaterial;
          case Status.Approved:
            return this.approvedLineMaterial;
          case Status.Suggested:
            return this.suggestedLineMaterial;
          case Status.Rejected:
            return this.rejectedLineMaterial;
          default:
            return this.suggestedLineMaterial;
        }
    }
  }

  private setStyle(style: AnnotationsRenderStyle, status: Status, selected: boolean): void {
    const material = this.getLineMaterial(status, selected);
    material.linewidth = selected ? style.selectedLineWidth : style.lineWidth;
    material.depthTest = style.depthTest;
    material.color.set(style.getColorByStatus(status));
  }

  // ==================================================
  // INSTANCE METHODS: Create Wireframes
  // ==================================================

  private addWireframeFromMultipleAnnotations(args: CreateWireframeArgs): void {
    const material = this.getLineMaterial(args.status, args.selected);
    const wireframe = createWireframeFromMultipleAnnotations(args, material);
    if (wireframe !== undefined) {
      this.addChild(wireframe);
    }
  }
}

// ==================================================
// FUNCTIONS: Creators
// ==================================================

function createLineMaterial(): LineMaterial {
  return new LineMaterial({
    resolution: new Vector2(800, 800),
    dashed: false,
    depthTest: true,
    dashScale: 8
  });
}

function createMeshByMatrix(
  matrix: Matrix4,
  material: MeshBasicMaterial,
  isCylinder: boolean
): Mesh {
  const geometry = isCylinder ? CylinderUtils.createUnitGeometry() : BoxUtils.createUnitGeometry();
  if (isCylinder) {
    // In Three.js, the cylinder is oriented along the Y-axis, so we need to rotate it
    // so up is the Z-axis.
    geometry.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.clone().invert());
  }
  const mesh = new Mesh(geometry, material);
  mesh.applyMatrix4(matrix);
  return mesh;
}

// ==================================================
// FUNCTIONS: Getters
// ==================================================

function* getAllWireframes(root: Object3D | null): Generator<Wireframe> {
  if (root === null) {
    return;
  }
  for (const child of root.children) {
    if (child instanceof Wireframe) {
      yield child;
    }
    if (child instanceof Mesh) {
      continue;
    }
    for (const wireframe of getAllWireframes(child)) {
      yield wireframe;
    }
  }
}

function getUserData(wireframe: Wireframe): WireframeUserData {
  return wireframe.userData as WireframeUserData;
}

// ==================================================
// FUNCTIONS: Misc
// ==================================================

function dispose(object3D: Object3D): void {
  object3D.traverse((child) => {
    if (child instanceof Wireframe) {
      child.geometry.dispose();
    } else if (child instanceof Mesh) {
      child.geometry.dispose();
    }
  });
}
