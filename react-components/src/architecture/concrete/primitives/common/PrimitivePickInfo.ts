import { type FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { type BoxFace } from './BoxFace';
import { Vector3 } from 'three';

/**
 * Represents information about a picked box.
 */
export class PrimitivePickInfo {
  /**
   * The face of the primitive that was picked.
   */
  public readonly face: BoxFace;

  /**
   * The type of focus on the picked box.
   */
  public readonly focusType: FocusType;

  /**
   * Indicates the corner of the face.
   */
  public readonly cornerSign: Vector3;

  /**
   * Creates a new instance of PrimitivePickInfo.
   * @param face The face of the box that was picked.
   * @param focusType The type of focus on the picked box.
   * @param cornerSign Indicates the corner of the face.
   */
  public constructor(face: BoxFace, focusType: FocusType, cornerSign?: Vector3) {
    this.face = face;
    this.focusType = focusType;
    this.cornerSign = cornerSign ?? new Vector3();
  }
}
