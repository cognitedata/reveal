import { Group, Matrix4, Object3D, Vector2, Vector3 } from 'three';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe';

import {
  AnnotationModel,
  AnnotationStatus,
  AnnotationsBoundingVolume,
  AnnotationsBox,
  AnnotationsCylinder,
} from '@cognite/sdk';

import {
  ANNOTATION_APPROVED_COLOR,
  ANNOTATION_CONTEXTUALIZED_COLOR,
  ANNOTATION_CYLINDER_RADIUS_MARGIN,
  ANNOTATION_LINE_WIDTH,
  ANNOTATION_REJECTED_COLOR,
  ANNOTATION_SELECTED_LINE_WIDTH,
  ANNOTATION_SUGGESTED_COLOR,
} from '../../../../pages/ContextualizeEditor/constants';

import { createBoxGeometry } from './createBoxGeometry';
import { createCylinderGeometry } from './createCylinderGeometry';

const UP_AXIS = new Vector3(0, 1, 0);

enum Status {
  Contextualized, // This state is Approved and has AssetRef != undefined
  Approved,
  Suggested,
  Rejected,
}

export class AnnotationsView {
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public lineWidth: number = ANNOTATION_LINE_WIDTH;
  public selectedLineWidth: number = ANNOTATION_SELECTED_LINE_WIDTH;

  // All needed materials
  private contextualizedLineMaterial: LineMaterial;
  private approvedLineMaterial: LineMaterial;
  private suggestedLineMaterial: LineMaterial;
  private rejectedLineMaterial: LineMaterial;

  private contextualizedSelectedLineMaterial: LineMaterial;
  private approvedSelectedLineMaterial: LineMaterial;
  private suggestedSelectedLineMaterial: LineMaterial;
  private rejectedSelectedLineMaterial: LineMaterial;

  // Prototype for each volume type
  private boxGeometry: LineSegmentsGeometry;
  private cylinderGeometry: LineSegmentsGeometry;

  private root: THREE.Group = new Group(); // The root of the hierarcy

  // This is the only child of the root, annotations are added here
  // When show(hide) annotation I connect/disconnect the child-parent relation between this and the root.
  // Then this functionality doesn't change anything else in the system
  private annotations: THREE.Group | null = null;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  constructor(clientRect: { clientWidth: number; clientHeight: number }) {
    const resolution = new Vector2(
      clientRect.clientWidth,
      clientRect.clientHeight
    );
    // Create all needed materials upfront
    this.contextualizedLineMaterial = createLineMaterial(
      Status.Contextualized,
      this.lineWidth,
      resolution
    );
    this.approvedLineMaterial = createLineMaterial(
      Status.Approved,
      this.lineWidth,
      resolution
    );
    this.suggestedLineMaterial = createLineMaterial(
      Status.Suggested,
      this.lineWidth,
      resolution
    );
    this.rejectedLineMaterial = createLineMaterial(
      Status.Rejected,
      this.lineWidth,
      resolution
    );

    this.contextualizedSelectedLineMaterial = createLineMaterial(
      Status.Contextualized,
      this.selectedLineWidth,
      resolution
    );
    this.approvedSelectedLineMaterial = createLineMaterial(
      Status.Approved,
      this.selectedLineWidth,
      resolution
    );
    this.suggestedSelectedLineMaterial = createLineMaterial(
      Status.Suggested,
      this.selectedLineWidth,
      resolution
    );
    this.rejectedSelectedLineMaterial = createLineMaterial(
      Status.Rejected,
      this.selectedLineWidth,
      resolution
    );

    // Create the prototype for each volume type
    this.boxGeometry = createBoxGeometry();
    this.cylinderGeometry = createCylinderGeometry();
  }

  //==================================================
  // INSTANCE METHODS: Show/Hide/Regenerate
  //==================================================

  public getRoot(): THREE.Group {
    return this.root;
  }

  public isVisible(): boolean {
    if (!this.annotations) {
      return false; // Annotations are not made made
    }
    if (!this.root.parent) {
      return false; // Root is not connected to the viewer
    }
    if (!this.annotations.parent) {
      return false; // Hidden
    }
    return true; // Visible
  }

  public show() {
    if (!this.annotations) {
      return; // Annotations are not made made
    }
    if (this.annotations.parent) {
      return; // Already visible
    }
    this.root.add(this.annotations); // Add to scene
  }

  public hide() {
    if (!this.annotations) {
      return; // Annotations are not made made
    }
    if (!this.annotations.parent) {
      return; // Already hidden
    }
    // Remove from the scene, but kept in memory
    this.annotations.removeFromParent();
  }

  public rebuild(annotations: AnnotationModel[], matrix: THREE.Matrix4) {
    const isVisible = this.isVisible();
    this.hide();
    this.annotations = this.createAnnotationsAsWireframes(annotations, matrix);
    if (isVisible) {
      this.show();
    }
  }

  //==================================================
  // INSTANCE METHODS: Selection
  //==================================================

  public selectById(annotationId: number, expandSelection = false) {
    if (!this.annotations) {
      return;
    }
    for (const wireframe of this.getWireframes()) {
      const userData = wireframe.userData as UserData;
      if (!userData) {
        continue;
      }
      if (userData.id !== annotationId) {
        if (!expandSelection) {
          this.setSelected(wireframe, false);
        }
      } else {
        this.setSelected(wireframe, true);
      }
    }
  }

  public selectByWireframe(
    wireframeToSelect: Wireframe,
    expandSelection = false
  ) {
    if (!this.annotations) {
      return;
    }
    for (const wireframe of this.getWireframes()) {
      if (wireframe !== wireframeToSelect) {
        if (!expandSelection) {
          this.setSelected(wireframe, false);
        }
      } else {
        this.setSelected(wireframe, true);
      }
    }
  }

  public selectAll(selected: boolean) {
    if (!this.annotations) {
      return;
    }
    for (const wireframe of this.getWireframes())
      this.setSelected(wireframe, selected);
  }

  public setSelected(wireframe: Wireframe, selected: boolean) {
    const userData = wireframe.userData as UserData;
    if (!userData) {
      return;
    }
    wireframe.material = this.getLineMaterial(userData.status, selected);
  }

  //==================================================
  // INSTANCE METHODS: Misc
  //==================================================

  private *getWireframes(): Generator<Wireframe> {
    if (!this.annotations) {
      return;
    }
    for (const wireframe of getAllWireframes(this.annotations)) {
      yield wireframe;
    }
  }

  //==================================================
  // INSTANCE METHODS: Material
  //==================================================

  private getLineMaterial(status: Status, selected: boolean): LineMaterial {
    switch (status) {
      case Status.Contextualized:
        return selected
          ? this.contextualizedSelectedLineMaterial
          : this.contextualizedLineMaterial;

      case Status.Approved:
        return selected
          ? this.approvedSelectedLineMaterial
          : this.approvedLineMaterial;

      case Status.Suggested:
        return selected
          ? this.suggestedSelectedLineMaterial
          : this.suggestedLineMaterial;

      default:
        return selected
          ? this.rejectedSelectedLineMaterial
          : this.rejectedLineMaterial;
    }
  }

  //==================================================
  // INSTANCE METHODS: Create Wireframes
  //==================================================

  private createAnnotationsAsWireframes(
    annotations: AnnotationModel[],
    matrix: THREE.Matrix4
  ): THREE.Group {
    // The group of wireframes will have the annotationId in its user data, so it can be found later and changed
    const mainGroup = new Group();
    for (const annotation of annotations) {
      const group = this.createAnnotationAsWireframes(annotation, matrix);
      if (group) {
        mainGroup.add(group);
      }
    }
    return mainGroup;
  }

  private createAnnotationAsWireframes(
    annotation: AnnotationModel,
    matrix: THREE.Matrix4
  ): THREE.Group | null {
    // The group will have the annotationId in its user data, so it can be found later and changed
    const volume = annotation.data as AnnotationsBoundingVolume;
    if (volume.region.length === 0) {
      return null;
    }
    const assetId = volume.assetRef?.id;

    const status = getStatus(annotation.status, assetId);
    const group = new Group();
    group.userData = new UserData(annotation.id, status); // Set the status and id
    const material = this.getLineMaterial(status, false);

    for (const regionPart of volume.region) {
      let wireframe: Wireframe | null = null;

      if (regionPart.box) {
        wireframe = this.createBoxAnnotationAsWireframe(regionPart.box, matrix);
      } else if (regionPart.cylinder) {
        wireframe = this.createCylinderAnnotationAsWireframe(
          regionPart.cylinder,
          matrix
        );
      }
      if (!wireframe) {
        continue;
      }
      wireframe.userData = new UserData(annotation.id, status); // Set the status and id
      wireframe.material = material;
      wireframe.computeLineDistances();
      group.add(wireframe);
    }
    return group;
  }

  private createBoxAnnotationAsWireframe(
    box: AnnotationsBox,
    matrix: THREE.Matrix4
  ): Wireframe {
    // Adjust and apply the matrix
    const boxMatrix = new Matrix4();
    boxMatrix.fromArray(box.matrix);
    boxMatrix.transpose();

    const actualMatrix = matrix.clone();
    actualMatrix.multiply(boxMatrix);

    const wireframe = new Wireframe(this.boxGeometry);
    wireframe.applyMatrix4(actualMatrix);
    wireframe.scale.setFromMatrixScale(actualMatrix);
    return wireframe;
  }

  private createCylinderAnnotationAsWireframe(
    cylinder: AnnotationsCylinder,
    matrix: THREE.Matrix4
  ): Wireframe {
    // Calculate the center of the cylinder
    const centerA = new Vector3(...cylinder.centerA);
    const centerB = new Vector3(...cylinder.centerB);

    centerA.applyMatrix4(matrix);
    centerB.applyMatrix4(matrix);

    const center = centerB.clone();
    center.add(centerA);
    center.multiplyScalar(0.5);

    // Calculate the axis of the cylinder
    const axis = centerB.clone();
    axis.sub(centerA);
    axis.normalize();

    // Calculate the scale of the cylinder
    const radius = cylinder.radius * (1 + ANNOTATION_CYLINDER_RADIUS_MARGIN);
    const height = centerA.distanceTo(centerB);
    const scale = new Vector3(radius, height, radius);

    const wireframe = new Wireframe(this.cylinderGeometry);
    wireframe.position.copy(center);
    wireframe.scale.copy(scale);
    // Use quaternion to rotate cylinder from default to target orientation
    wireframe.quaternion.setFromUnitVectors(UP_AXIS, axis);
    return wireframe;
  }
}

class UserData {
  public id: number;
  public status: Status;

  constructor(id: number, status: Status) {
    this.id = id;
    this.status = status;
  }
}

//==================================================
// FUNCTIONS
//==================================================

function createLineMaterial(
  status: Status,
  lineWidth: number,
  resolution: THREE.Vector2
): LineMaterial {
  const color = getColorByStatus(status);
  return new LineMaterial({
    color: color,
    linewidth: lineWidth,
    resolution: resolution,
    dashed: false,
  });
}

function* getAllWireframes(root: Object3D | null): Generator<Wireframe> {
  if (!root) {
    return;
  }
  for (const child of root.children) {
    if (child instanceof Wireframe) {
      yield child;
    }
    for (const wireframe of getAllWireframes(child)) {
      yield wireframe;
    }
  }
}

function getStatus(
  status: AnnotationStatus,
  assetId: number | undefined
): Status {
  if (assetId) {
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

function getColorByStatus(status: Status): number {
  switch (status) {
    case Status.Contextualized:
      return ANNOTATION_CONTEXTUALIZED_COLOR;
    case Status.Approved:
      return ANNOTATION_APPROVED_COLOR;
    case Status.Suggested:
      return ANNOTATION_SUGGESTED_COLOR;
    default:
      return ANNOTATION_REJECTED_COLOR;
  }
}
