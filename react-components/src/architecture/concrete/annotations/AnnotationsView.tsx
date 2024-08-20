/*!
 * Copyright 2024 Cognite AS
 */

import * as THREE from 'three';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe.js';

import { type CustomObjectIntersectInput, type CustomObjectIntersection } from '@cognite/reveal';
import { type AnnotationStatus } from '@cognite/sdk';

import {
  ANNOTATION_LINE_WIDTH,
  ANNOTATION_SELECTED_LINE_WIDTH,
  ANNOTATION_PENDING_LINE_WIDTH,
  ANNOTATION_BLANK_COLOR,
  ANNOTATION_BLANK_OPACITY,
  ANNOTATION_PENDING_COLOR
} from './utils/constants';
import { type PointCloudAnnotation, TransformMode } from './utils/types';

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

const HOVERED_ANNOTATION_NAME = 'hovered-annotation-name';
const GROUP_SIZE = 100;
const BOX_GEOMETRY = createBoxGeometry(); // Prototype for a box
const CYLINDER_GEOMETRY = createCylinderGeometry(); // Prototype for a box

export enum Status {
  Contextualized, // This state is Approved and has AssetRef != undefined
  Approved,
  Suggested,
  Rejected
}

type LineMaterialConfig = {
  status: Status;
  linewidth: number;
  resolution: THREE.Vector2;
  depthTest?: boolean;
  dashed: boolean;
};

export enum AnnotationType {
  SELECTED_ANNOTATION = 'selectedAnnotation',
  NORMAL_ANNOTATION = 'normalAnnotation'
}

export class AnnotationsView extends GroupThreeView<AnnotationsDomainObject> {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  // All needed materials
  private readonly contextualizedLineMaterial: LineMaterial;
  private readonly approvedLineMaterial: LineMaterial;
  private readonly suggestedLineMaterial: LineMaterial;
  private readonly rejectedLineMaterial: LineMaterial;

  private readonly contextualizedSelectedLineMaterial: LineMaterial;
  private readonly approvedSelectedLineMaterial: LineMaterial;
  private readonly suggestedSelectedLineMaterial: LineMaterial;
  private readonly rejectedSelectedLineMaterial: LineMaterial;

  private readonly pendingLineMaterial: LineMaterial;
  private readonly hoveredAnnotationMaterial: THREE.MeshBasicMaterial;

  // This is the only child of the root, annotations are added here
  // When show(hide) annotation I connect/disconnect the child-parent relation between this and the root.
  // Then this functionality doesn't change anything else in the system
  private readonly globalMatrix: THREE.Matrix4 = new THREE.Matrix4();

  private prevTransformMode: TransformMode = TransformMode.NONE;

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

    const resolution = new THREE.Vector2(800, 800);
    // Create all needed materials upfront
    const baseConfig = {
      linewidth: ANNOTATION_LINE_WIDTH,
      resolution,
      depthTest: true,
      dashed: false
    };

    const selectedConfig = {
      linewidth: ANNOTATION_SELECTED_LINE_WIDTH,
      resolution,
      depthTest: true,
      dashed: false
    };

    const pendingConfig = {
      linewidth: ANNOTATION_PENDING_LINE_WIDTH,
      resolution,
      depthTest: true,
      dashed: false
    };

    this.contextualizedLineMaterial = createLineMaterial({
      ...baseConfig,
      status: Status.Contextualized
    });

    this.approvedLineMaterial = createLineMaterial({
      ...baseConfig,
      status: Status.Approved
    });

    this.suggestedLineMaterial = createLineMaterial({
      ...baseConfig,
      status: Status.Suggested
    });

    this.rejectedLineMaterial = createLineMaterial({
      ...baseConfig,
      status: Status.Rejected
    });

    this.contextualizedSelectedLineMaterial = createLineMaterial({
      ...selectedConfig,
      status: Status.Contextualized
    });

    this.approvedSelectedLineMaterial = createLineMaterial({
      ...selectedConfig,
      status: Status.Approved
    });

    this.suggestedSelectedLineMaterial = createLineMaterial({
      ...selectedConfig,
      status: Status.Suggested
    });

    this.rejectedSelectedLineMaterial = createLineMaterial({
      ...selectedConfig,
      status: Status.Rejected
    });

    this.pendingLineMaterial = new LineMaterial({
      ...pendingConfig,
      color: ANNOTATION_PENDING_COLOR
    });

    this.hoveredAnnotationMaterial = new THREE.MeshBasicMaterial({
      color: ANNOTATION_BLANK_COLOR,
      transparent: true,
      opacity: ANNOTATION_BLANK_OPACITY,
      depthTest: true
    });
  }

  // ==================================================
  // OVERRIDES of BaseView
  // ==================================================

  public override update(change: DomainObjectChange): void {
    super.update(change);
    if (change.isChanged(Changes.selected, Changes.renderStyle, Changes.color, Changes.clipping)) {
      this.clearMemory();
      this.invalidateRenderTarget();
    }
  }

  // ==================================================
  // OVERRIDES of GroupThreeView
  // ==================================================

  public override get useDepthTest(): boolean {
    return this.style.depthTest;
  }

  protected override addChildren(): void {
    const { domainObject } = this;

    const annotations = domainObject.annotations;

    for (const status of [
      Status.Rejected,
      Status.Suggested,
      Status.Approved,
      Status.Contextualized
    ]) {
      const filteredAnnotation = annotations.filter(
        (annotation) => getStatusByAnnotation(annotation) === status
      );
      for (let startIndex = 0; startIndex < filteredAnnotation.length; startIndex += GROUP_SIZE) {
        this.addWireframeFromMultipleAnnotations({
          annotations: filteredAnnotation,
          globalMatrix,
          status,
          annotationType: AnnotationType.NORMAL_ANNOTATION,
          startIndex,
          groupSize: GROUP_SIZE
        });
      }
    }
  }

  override intersectIfCloser(
    intersectInput: CustomObjectIntersectInput,
    closestDistance: number | undefined
  ): undefined | CustomObjectIntersection {
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
    return {
      type: 'customObject',
      distanceToCamera: closestFinder.minDistance,
      point: info.point,
      customObject: this,
      boundingBox: getBoundingBox(info.annotation, this.globalMatrix),
      userData: info.annotation
    };
  }

  // ==================================================
  // INSTANCE METHODS: Selected annotation
  // ==================================================

  public setSelectedAnnotation(annotation: PointCloudAnnotation | null): void {
    if (annotation === null) {
      this.clearSelectedAnnotation();
    } else {
      this.styleAnnotation(annotation, AnnotationType.SELECTED_ANNOTATION);
    }
  }

  private styleAnnotation(annotation: PointCloudAnnotation, annotationType: AnnotationType): void {
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
        this.styleWireframe(wireframe, AnnotationType.NORMAL_ANNOTATION);
      } else if (userData.length === 1) {
        this.styleWireframe(wireframe, annotationType);
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
        annotationType: userData.annotationType,
        startIndex: 0
      });
      const changingAnnotations = [annotation];
      if (changingAnnotations.length > 0) {
        this.addWireframeFromMultipleAnnotations({
          annotations: changingAnnotations,
          globalMatrix: this.globalMatrix,
          status: userData.status,
          annotationType,
          startIndex: 0
        });
      }
      this._group.remove(wireframeToSplit);
      dispose(wireframeToSplit);
    }
  }

  private clearSelectedAnnotation(): void {
    for (const wireframe of this.getWireframes())
      this.styleWireframe(wireframe, AnnotationType.NORMAL_ANNOTATION);
  }

  private styleWireframe(wireframe: Wireframe, annotationType: AnnotationType): void {
    const userData = getUserData(wireframe);
    if (userData === undefined) {
      return;
    }
    userData.annotationType = annotationType;
    wireframe.material = this.getLineMaterial(userData.status, userData.annotationType);
  }

  // ==================================================
  // INSTANCE METHODS: Pending annotation
  // ==================================================

  public setPendingAnnotation(pendingAnnotation: PendingAnnotation | null): void {
    this.transformControls.detach();
    this.clearPendingAnnotation();
    if (pendingAnnotation === null) {
      return;
    }
    const wireframe = this.createPendingAnnotationAsWireframe(pendingAnnotation);
    this.addChild(wireframe);

    this.transformControls.attach(wireframe);
    this.setTransformControlsMode(this.prevTransformMode);
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

    wireframe.userData = new WireframeUserData(Status.Suggested, AnnotationType.NORMAL_ANNOTATION);
    wireframe.material = this.pendingLineMaterial;
    wireframe.computeLineDistances();
    return wireframe;
  }

  // ==================================================
  // INSTANCE METHODS: Transform control
  // ==================================================

  public setTransformControlsMode(transformMode: TransformMode): void {
    this.prevTransformMode = transformMode;
    if (transformMode === TransformMode.NONE) {
      this.setTransformControlsVisibility(false);
      return;
    }
    this.setTransformControlsVisibility(true);
    this.transformControls.setMode(transformMode);
  }

  private setTransformControlsVisibility(visible: boolean): void {
    this.transformControls.visible = visible;
    this.transformControls.enabled = visible;
  }

  // ==================================================
  // INSTANCE METHODS: Hovered Annotation
  // ==================================================

  public setHoveredAnnotation(annotation: PointCloudAnnotation | undefined): void {
    this.clearHoveredAnnotation();
    if (annotation === undefined) {
      return;
    }
    if (this.transformControls.visible) {
      return;
    }
    const group = new THREE.Group();
    group.name = HOVERED_ANNOTATION_NAME;
    this.addChild(group);

    for (const geometry of getAnnotationGeometries(annotation)) {
      const matrix = getAnnotationMatrixByGeometry(geometry);
      if (matrix === undefined) {
        continue;
      }
      matrix.premultiply(this.globalMatrix);
      const isCylinder = geometry.cylinder !== undefined;
      const mesh = createMeshByMatrix(matrix, this.hoveredAnnotationMaterial, isCylinder);
      group.add(mesh);
    }
  }

  private clearHoveredAnnotation(): void {
    const group = this._group.getObjectByName(HOVERED_ANNOTATION_NAME);
    if (group === undefined) {
      return;
    }
    this._group.remove(group);
    dispose(group);
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

  private getLineMaterial(status: Status, annotationType: AnnotationType): LineMaterial {
    switch (annotationType) {
      case AnnotationType.SELECTED_ANNOTATION:
        switch (status) {
          case Status.Contextualized:
            return this.contextualizedSelectedLineMaterial;
          case Status.Approved:
            return this.approvedSelectedLineMaterial;
          case Status.Suggested:
            return this.suggestedSelectedLineMaterial;
          case Status.Rejected:
            return this.rejectedSelectedLineMaterial;
          default:
            return this.suggestedSelectedLineMaterial;
        }
      case AnnotationType.NORMAL_ANNOTATION:
        switch (status) {
          case Status.Contextualized:
            return this.contextualizedLineMaterial;
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
  // ==================================================
  // INSTANCE METHODS: Create Wireframes
  // ==================================================

  private addWireframeFromMultipleAnnotations(args: CreateWireframeArgs): void {
    const material = this.getLineMaterial(args.status, args.annotationType);
    const wireframe = createWireframeFromMultipleAnnotations(args, material);
    if (wireframe !== undefined) {
      this.addChild(wireframe);
    }
  }
}

// ==================================================
// FUNCTIONS: Creators
// ==================================================

function createLineMaterial(config: LineMaterialConfig): LineMaterial {
  const { status, linewidth, resolution, dashed, depthTest } = config;
  const color = getColorByStatus(status);
  return new LineMaterial({
    color,
    linewidth,
    resolution,
    dashed,
    depthTest,
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
