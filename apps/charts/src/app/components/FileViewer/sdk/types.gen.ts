// copied from https://github.com/cognitedata/cognite-sdk-js/blob/master/packages/stable/src/api/annotations/types.gen.ts

// Do not modify this file!
// It was generated by the command "yarn codegen".
// Instead update the code generation logic or the OpenAPI document.

/**
* The annotation information. The format of this object is decided by and validated against the `annotationType`
attribute.
* @example {"assetRef":{"externalId":"abc"},"symbolRegion":{"xMin":0.1,"xMax":0.2,"yMin":0.1,"yMax":0.2},"textRegion":{"xMin":0.2,"xMax":0.3,"yMin":0.2,"yMax":0.3},"pageNumber":43}
*/
export type AnnotationData =
  | AnnotationsObjectDetection
  | AnnotationsClassification
  | AnnotationsKeypointCollection
  | AnnotationsCogniteAnnotationTypesImagesAssetLink
  | AnnotationsTextRegion
  | AnnotationsCogniteAnnotationTypesDiagramsAssetLink
  | AnnotationsFileLink
  | AnnotationsUnhandledTextObject
  | AnnotationsUnhandledSymbolObject
  | AnnotationsExtractedText
  | AnnotationsLine
  | AnnotationsJunction
  | AnnotationsBoundingVolume
  | AnnotationsDetection;

/**
* Models an image object detection represented by a label, a geometry, and
optionally a confidence value.
*/
export interface AnnotationsObjectDetection {
  /** A plain rectangle */
  boundingBox?: AnnotationsBoundingBox;

  /**
   * A _closed_ polygon represented by _n_ vertices. In other words, we assume
   * that the first and last vertex are connected.
   */
  polygon?: AnnotationsPolygon;

  /** A polygonal chain consisting of _n_ vertices */
  polyline?: AnnotationsPolyLine;

  /** The label describing what type of object it is */
  label: string;

  /**
   * The confidence score for the primitive. It should be between 0 and 1.
   * @min 0
   * @max 1
   */
  confidence?: number;
}

/**
* Models an image classification represented by a label, and optionally a
confidence value.
*/
export interface AnnotationsClassification {
  /** The label describing what type of object it is */
  label: string;

  /**
   * The confidence score for the primitive. It should be between 0 and 1.
   * @min 0
   * @max 1
   */
  confidence?: number;
}

/**
* Models a collection of keypoints represented by a label, a dictionary of
keypoints (mapping from a (unique) label name to a keypoint), and
optionally a confidence value and an attributes dictionary.
*/
export interface AnnotationsKeypointCollection {
  /** Additional attributes data for a compound. */
  attributes?: Record<
    string,
    | AnnotationsBoolean
    | AnnotationsNumerical
    | (AnnotationsBoolean & AnnotationsNumerical)
  >;

  /** The label describing what type of object it is */
  label: string;

  /**
   * The confidence score for the primitive. It should be between 0 and 1.
   * @min 0
   * @max 1
   */
  confidence?: number;

  /** The detected keypoints */
  keypoints: Record<string, AnnotationsKeypoint>;
}

/**
 * Models a link to a CDF Asset referenced in an image
 */
export interface AnnotationsCogniteAnnotationTypesImagesAssetLink {
  /**
   * The confidence score for the primitive. It should be between 0 and 1.
   * @min 0
   * @max 1
   */
  confidence?: number;

  /** The asset this annotation is pointing to */
  assetRef: AnnotationsAssetRef;

  /** The extracted text */
  text: string;

  /** The location of the text mentioning the asset */
  textRegion: AnnotationsBoundingBox;
}

/**
 * Models an extracted text region in an image
 */
export interface AnnotationsTextRegion {
  /**
   * The confidence score for the primitive. It should be between 0 and 1.
   * @min 0
   * @max 1
   */
  confidence?: number;

  /** The extracted text */
  text: string;

  /** The location of the extracted text */
  textRegion: AnnotationsBoundingBox;
}

/**
 * Models a link to a CDF Asset referenced in an engineering diagram
 */
export interface AnnotationsCogniteAnnotationTypesDiagramsAssetLink {
  /**
   * The number of the page on which this annotation is located. The first page has number 1.
   * @min 1
   * @max 2048
   */
  pageNumber?: number;

  /** The asset this annotation is pointing to */
  assetRef: AnnotationsAssetRef;

  /** The location of the symbol representing the asset */
  symbolRegion?: AnnotationsBoundingBox;

  /** The location of the text mentioning the asset */
  textRegion: AnnotationsBoundingBox;

  /** The extracted text */
  text?: string;

  /** The symbol representing the asset */
  symbol?: string;
}

/**
 * Models a link to a CDF File referenced in an engineering diagram
 */
export interface AnnotationsFileLink {
  /**
   * The number of the page on which this annotation is located. The first page has number 1.
   * @min 1
   * @max 2048
   */
  pageNumber?: number;

  /** The file this annotation is pointing to */
  fileRef: AnnotationsFileRef;

  /** The location of the symbol representing the file */
  symbolRegion?: AnnotationsBoundingBox;

  /** The location of the text mentioning the file */
  textRegion: AnnotationsBoundingBox;

  /** The extracted text */
  text?: string;

  /** The symbol found in the file */
  symbol?: string;
}

/**
 * Models an extracted text region in an engineering diagram
 */
export interface AnnotationsUnhandledTextObject {
  /**
   * The number of the page on which this annotation is located. The first page has number 1.
   * @min 1
   * @max 2048
   */
  pageNumber?: number;

  /** The location of the text */
  textRegion: AnnotationsBoundingBox;

  /** The extracted text */
  text: string;
}

/**
 * Models an extracted symbol region in an engineering diagram
 */
export interface AnnotationsUnhandledSymbolObject {
  /**
   * The number of the page on which this annotation is located. The first page has number 1.
   * @min 1
   * @max 2048
   */
  pageNumber?: number;

  /** The location of the symbol */
  symbolRegion: AnnotationsBoundingBox;

  /** The symbol found in the file */
  symbol: string;
}

/**
 * Represents text extracted from a document. Annotations of this type are low-level and not specific to any domain.
 */
export interface AnnotationsExtractedText {
  /**
   * The number of the page on which this annotation is located. The first page has number 1.
   * @min 1
   * @max 2048
   */
  pageNumber?: number;

  /** The location of the extracted text */
  textRegion: AnnotationsBoundingBox;

  /** The extracted text */
  extractedText: string;
}

/**
 * Models a line in an engineering diagram
 */
export interface AnnotationsLine {
  /** The label describing what type of object it is */
  label: string;

  /**
   * The number of the page on which this annotation is located. The first page has number 1.
   * @min 1
   * @max 2048
   */
  pageNumber?: number;

  /** The polyline representing the line */
  polyline: AnnotationsPolyLine;
}

/**
 * Models a junction between lines in an engineering diagram
 */
export interface AnnotationsJunction {
  /**
   * The number of the page on which this annotation is located. The first page has number 1.
   * @min 1
   * @max 2048
   */
  pageNumber?: number;

  /** The point representing the junction */
  position: AnnotationsPoint;
}

/**
 * A bounding volume represents a region in a point cloud
 */
export interface AnnotationsBoundingVolume {
  /** The label describing what type of object it is */
  label?: string;

  /**
   * The confidence score for the primitive. It should be between 0 and 1.
   * @min 0
   * @max 1
   */
  confidence?: number;

  /** The asset this annotation is pointing to */
  assetRef?: AnnotationsAssetRef;

  /** The region of the annotation defined by a list of geometry primitives (cylinder and box). */
  region: AnnotationsGeometry[];
}

/**
* Represents a detection of a field value in a form.
A field is identified by a field_name, optionally component_name and component_type if the field belongs to a subcomponent.
The bounding_box indicates the position of the detection. The content of the field is given by the value, and optionally
an unnormalized_value and the unit.
*/
export interface AnnotationsDetection {
  /**
   * The confidence score for the primitive. It should be between 0 and 1.
   * @min 0
   * @max 1
   */
  confidence?: number;

  /**
   * The number of the page on which this annotation is located. The first page has number 1.
   * @min 1
   * @max 2048
   */
  pageNumber?: number;

  /** Bounding box of the detection area */
  boundingBox: AnnotationsBoundingBox;

  /** Type of subcomponent that the detection belongs to */
  componentType?: string;

  /** Name of subcomponent that the detection belongs to */
  componentName?: string;

  /** Name of field that has been detected */
  fieldName: string;

  /** The value that has been detected */
  value: string;

  /** The value that has been detected, before normalization. Optional. */
  valueUnnormalized?: string;

  /** The unit of the value field. Optional. */
  unit?: string;
}

/**
 * A plain rectangle
 */
export interface AnnotationsBoundingBox {
  /**
   * The confidence score for the primitive. It should be between 0 and 1.
   * @min 0
   * @max 1
   */
  confidence?: number;

  /**
   * Minimum abscissa of the bounding box (left edge). Must be strictly less than x_max.
   * @min 0
   * @max 1
   */
  xMin: number;

  /**
   * Maximum abscissa of the bounding box (right edge). Must be strictly more than x_min.
   * @min 0
   * @max 1
   */
  xMax: number;

  /**
   * Minimum ordinate of the bounding box (bottom edge). Must be strictly less than y_max.
   * @min 0
   * @max 1
   */
  yMin: number;

  /**
   * Maximum ordinate of the bounding box (top edge). Must be strictly more than y_min.
   * @min 0
   * @max 1
   */
  yMax: number;
}

/**
 * A reference to an asset. Either the internal ID or the external ID must be provided (exactly one).
 */
export type AnnotationsAssetRef = { id?: number; externalId?: string };

/**
 * A 3D geometry model represented by exactly *one of* `cylinder` and `box`.
 */
export interface AnnotationsGeometry {
  /** A cylinder in 3D space, defined by the centers of two sides and the radius. */
  cylinder?: AnnotationsCylinder;

  /**
   * A box in 3D space, defined by a 4x4 row-major homogeneous transformation matrix that rotates and
   * translates a unit box centered at the origin to it's location and orientation in 3D space.
   */
  box?: AnnotationsBox;
}

/**
 * A cylinder in 3D space, defined by the centers of two sides and the radius.
 */
export interface AnnotationsCylinder {
  /** The label describing what type of object it is */
  label?: string;

  /**
   * The confidence score for the primitive. It should be between 0 and 1.
   * @min 0
   * @max 1
   */
  confidence?: number;

  /** The center of the first cap. */
  centerA: number[];

  /** The center of the second cap. */
  centerB: number[];

  /**
   * The radius of the cylinder.
   * @min 0
   */
  radius: number;
}

/**
* A box in 3D space, defined by a 4x4 row-major homogeneous transformation matrix that rotates and
translates a unit box centered at the origin to it's location and orientation in 3D space.
*/
export interface AnnotationsBox {
  /** The label describing what type of object it is */
  label?: string;

  /**
   * The confidence score for the primitive. It should be between 0 and 1.
   * @min 0
   * @max 1
   */
  confidence?: number;

  /** The homogeneous transformation matrix */
  matrix: number[];
}

/**
 * Point in a 2D-Cartesian coordinate system with origin at the top-left corner of the page
 */
export interface AnnotationsPoint {
  /**
   * The confidence score for the primitive. It should be between 0 and 1.
   * @min 0
   * @max 1
   */
  confidence?: number;

  /**
   * The abscissa of the point in a coordinate system with origin at the top-left corner of the page. Normalized in (0,1).
   * @min 0
   * @max 1
   */
  x: number;

  /**
   * The ordinate of the point in a coordinate system with origin at the top-left corner of the page. Normalized in (0,1).
   * @min 0
   * @max 1
   */
  y: number;
}

/**
 * A polygonal chain consisting of _n_ vertices
 */
export interface AnnotationsPolyLine {
  /**
   * The confidence score for the primitive. It should be between 0 and 1.
   * @min 0
   * @max 1
   */
  confidence?: number;
  vertices: AnnotationsPoint[];
}

/**
 * A reference to a file. Either the internal ID or the external ID must be provided (exactly one).
 */
export type AnnotationsFileRef = { id?: number; externalId?: string };

/**
 * The boolean value of something
 */
export interface AnnotationsBoolean {
  /** The description of a primitive */
  description?: string;
  type: 'boolean';

  /** The boolean value */
  value: boolean;
}

/**
 * The numerical value of something
 */
export interface AnnotationsNumerical {
  /** The description of a primitive */
  description?: string;
  type: 'numerical';

  /** The numerical value */
  value: number | number;
}

/**
* A point attached with additional information such as a confidence value and
various attribute(s).
*/
export interface AnnotationsKeypoint {
  /** Additional attributes data for a compound. */
  attributes?: Record<
    string,
    | AnnotationsBoolean
    | AnnotationsNumerical
    | (AnnotationsBoolean & AnnotationsNumerical)
  >;

  /**
   * The confidence score for the primitive. It should be between 0 and 1.
   * @min 0
   * @max 1
   */
  confidence?: number;

  /** The position of the keypoint */
  point: AnnotationsPoint;
}

/**
* A _closed_ polygon represented by _n_ vertices. In other words, we assume
that the first and last vertex are connected.
*/
export interface AnnotationsPolygon {
  /**
   * The confidence score for the primitive. It should be between 0 and 1.
   * @min 0
   * @max 1
   */
  confidence?: number;
  vertices: AnnotationsPoint[];
}