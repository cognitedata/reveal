/*!
 * Copyright 2024 Cognite AS
 */

import * as THREE from 'three';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe.js';

import {
  CDF_TO_VIEWER_TRANSFORMATION,
  type CustomObjectIntersectInput,
  type CustomObjectIntersection
} from '@cognite/reveal';
import { type AnnotationStatus } from '@cognite/sdk';

import { type PointCloudAnnotation } from './utils/types';

import {
  getAnnotationGeometries,
  isAnnotationsBoundingVolume
} from './utils/annotationGeometryUtils';
import { createBoxGeometry } from './utils/createBoxGeometry';
import { createCylinderGeometry } from './utils/createCylinderGeometry';
import {
  type CreateWireframeArgs,
  createWireframeFromMultipleAnnotations
} from './utils/createWireframeFromMultipleAnnotations';
import { getBoundingBox } from './utils/getBoundingBox';
import { getClosestAnnotation } from './utils/getClosestAnnotation';
import { getAnnotationMatrixByGeometry } from './utils/getMatrixUtils';
import { type PendingAnnotation } from './utils/PendingAnnotation';
import { WireframeUserData } from './utils/WireframeUserData';
import { GroupThreeView } from '../../base/views/GroupThreeView';
import { type AnnotationsDomainObject } from './AnnotationsDomainObject';
import { type AnnotationsRenderStyle } from './AnnotationsRenderStyle';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type DomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';

const FOCUS_ANNOTATION_NAME = 'focus-annotation-name';
const GROUP_SIZE = 100;
const BOX_GEOMETRY = createBoxGeometry(); // Prototype for a box
const CYLINDER_GEOMETRY = createCylinderGeometry(); // Prototype for a box

export enum Status {
  Contextualized, // This state is Approved and has AssetRef != undefined
  Approved,
  Suggested,
  Rejected
}

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

  private readonly pendingLineMaterial: LineMaterial;
  private readonly focusAnnotationMaterial: THREE.MeshBasicMaterial;

  // This is the only child of the root, annotations are added here
  // When show(hide) annotation I connect/disconnect the child-parent relation between this and the root.
  // Then this functionality doesn't change anything else in the system
  private readonly globalMatrix: THREE.Matrix4 = new THREE.Matrix4();

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

    this.pendingLineMaterial = createLineMaterial();

    this.focusAnnotationMaterial = new THREE.MeshBasicMaterial();
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
      this.setSelectedAnnotation(this.domainObject.selectedAnnotation);
      this.invalidateRenderTarget();
    }
    if (change.isChanged(Changes.focus)) {
      this.setFocusAnnotation(this.domainObject.focusAnnotation);
      this.invalidateRenderTarget();
    }
    if (change.isChanged(Changes.pending)) {
      this.setPendingAnnotation(this.domainObject.pendingAnnotation);
      this.invalidateRenderTarget();
    }
  }

  // ==================================================
  // OVERRIDES of GroupThreeView
  // ==================================================

  public override get useDepthTest(): boolean {
    return this.style.depthTest;
  }

  protected override calculateBoundingBox(): THREE.Box3 {
    const annotations = this.domainObject.annotations;
    const boundingBox = new THREE.Box3();
    boundingBox.makeEmpty();
    for (const annotation of annotations) {
      const annotationBoundingBox = getBoundingBox(annotation, this.globalMatrix);
      if (annotationBoundingBox !== undefined) {
        boundingBox.union(annotationBoundingBox);
      }
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

    const statuses = [Status.Rejected, Status.Suggested, Status.Approved, Status.Contextualized];
    for (const status of statuses) {
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
    // Set the other
    this.setSelectedAnnotation(this.domainObject.selectedAnnotation);
    this.setFocusAnnotation(this.domainObject.focusAnnotation);
    this.setPendingAnnotation(this.domainObject.pendingAnnotation);
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
      userData: info.annotation
    };
    return customObjectIntersection;
  }

  // ==================================================
  // INSTANCE METHODS: Selected annotation
  // ==================================================

  private setSelectedAnnotation(annotation: PointCloudAnnotation | undefined): void {
    if (annotation === undefined) {
      this.clearSelectedAnnotation();
    } else {
      this.styleAnnotation(annotation, true);
    }
  }

  private clearSelectedAnnotation(): void {
    for (const wireframe of this.getWireframes()) this.styleWireframe(wireframe, false);
  }

  // ==================================================
  // INSTANCE METHODS: Focus Annotation
  // ==================================================

  private setFocusAnnotation(annotation: PointCloudAnnotation | undefined): void {
    this.clearFocusAnnotation();
    if (annotation === undefined) {
      return;
    }
    const group = new THREE.Group();
    group.name = FOCUS_ANNOTATION_NAME;
    this.addChild(group);

    for (const geometry of getAnnotationGeometries(annotation)) {
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
  // INSTANCE METHODS: Pending annotation
  // ==================================================

  private setPendingAnnotation(pendingAnnotation: PendingAnnotation | undefined): void {
    this.clearPendingAnnotation();
    if (pendingAnnotation === undefined) {
      return;
    }
    const wireframe = this.createPendingAnnotationAsWireframe(pendingAnnotation);
    this.addChild(wireframe);
  }

  private clearPendingAnnotation(): void {
    for (const wireframe of this.getWireframes()) {
      const userData = getUserData(wireframe);
      if (userData === undefined) {
        continue;
      }
      if (userData.isPending) {
        this._group.remove(wireframe);
        dispose(wireframe);
        break;
      }
    }
  }

  private createPendingAnnotationAsWireframe(pendingAnnotation: PendingAnnotation): Wireframe {
    const wireframe = createPendingAnnotationAsWireframe(pendingAnnotation);

    wireframe.userData = new WireframeUserData(Status.Suggested, false);
    wireframe.material = this.pendingLineMaterial;
    wireframe.computeLineDistances();
    return wireframe;
  }

  // ==================================================
  // INSTANCE METHODS: Style annotation
  // ==================================================

  private updateRenderStyle(): void {
    const { style } = this;

    const statuses = [Status.Rejected, Status.Suggested, Status.Approved, Status.Contextualized];
    for (const status of statuses) {
      this.setStyle(style, status, false);
      this.setStyle(style, status, true);
    }
    this.pendingLineMaterial.color.set(style.pendingColor);
    this.pendingLineMaterial.linewidth = style.pendingLineWidth;
    this.pendingLineMaterial.depthTest = this.style.depthTest;

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

  private styleAnnotation(annotation: PointCloudAnnotation, selected: boolean): void {
    // This is only used by AnnotationType = SELECTED_ANNOTATION
    let wireframeToSplit: Wireframe | undefined;
    for (const wireframe of this.getWireframes()) {
      const userData = getUserData(wireframe);
      if (userData === undefined) {
        continue;
      }
      if (userData.isPending) {
        continue;
      }
      if (!userData.contain(annotation)) {
        this.styleWireframe(wireframe, false);
      } else if (userData.length === 1) {
        this.styleWireframe(wireframe, selected);
      } else {
        wireframeToSplit = wireframe;
      }
    }
    if (wireframeToSplit !== undefined) {
      const userData = getUserData(wireframeToSplit);
      const remainingAnnotations = userData.annotations.filter((a) => a !== annotation);
      this.addWireframeFromMultipleAnnotations({
        annotations: remainingAnnotations,
        globalMatrix: this.globalMatrix,
        status: userData.status,
        selected: userData.selected,
        startIndex: 0
      });
      const changingAnnotations = [annotation];
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
    resolution: new THREE.Vector2(800, 800),
    dashed: false,
    depthTest: true,
    dashScale: 8
  });
}

function createPendingAnnotationAsWireframe(pendingAnnotation: PendingAnnotation): Wireframe {
  const lineSegments = pendingAnnotation.isCylinder
    ? CYLINDER_GEOMETRY.clone()
    : BOX_GEOMETRY.clone();
  const wireframe = new Wireframe(lineSegments);
  const matrix = pendingAnnotation.matrix;
  wireframe.applyMatrix4(matrix);
  return wireframe;
}

function createMeshByMatrix(
  matrix: THREE.Matrix4,
  material: THREE.MeshBasicMaterial,
  isCylinder: boolean
): THREE.Mesh {
  const geometry = isCylinder
    ? new THREE.CylinderGeometry(1, 1, 1)
    : new THREE.BoxGeometry(2, 2, 2);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.applyMatrix4(matrix);
  return mesh;
}

// ==================================================
// FUNCTIONS: Getters
// ==================================================

function* getAllWireframes(root: THREE.Object3D | null): Generator<Wireframe> {
  if (root === null) {
    return;
  }
  for (const child of root.children) {
    if (child instanceof Wireframe) {
      yield child;
    }
    if (child instanceof THREE.Mesh) {
      continue;
    }
    for (const wireframe of getAllWireframes(child)) {
      yield wireframe;
    }
  }
}

function getStatusByAnnotation(annotation: PointCloudAnnotation): Status {
  const volume = annotation.geometry;
  if (!isAnnotationsBoundingVolume(volume)) {
    return Status.Rejected;
  }
  if (volume === undefined || volume.region.length === 0) {
    return Status.Rejected;
  }
  const assetId = volume.assetRef?.id;
  return getStatus(annotation.status, assetId);
}

function getUserData(wireframe: Wireframe): WireframeUserData {
  return wireframe.userData as WireframeUserData;
}

function getStatus(status: AnnotationStatus, assetId: number | undefined): Status {
  if (assetId !== undefined) {
    return Status.Contextualized;
  }
  if (status === 'approved') {
    return Status.Approved;
  }
  if (status === 'suggested') {
    return Status.Suggested;
  }
  return Status.Rejected;
}

// ==================================================
// FUNCTIONS: Misc
// ==================================================

function dispose(object3D: THREE.Object3D): void {
  object3D.traverse((child) => {
    if (child instanceof Wireframe) {
      child.geometry.dispose();
    } else if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
    }
  });
}
