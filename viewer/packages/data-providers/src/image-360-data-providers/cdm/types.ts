/*!
 * Copyright 2025 Cognite AS
 */
import { Vector3 } from 'three';
import { AssetSimpleProperties, CoreDmImage360AnnotationProperties, CoreDmImage360Properties } from './properties';
import {
  COGNITE_ASSET_VIEW_REFERENCE,
  CORE_DM_IMAGE_360_ANNOTATION_VIEW_REFERENCE,
  CORE_DM_IMAGE_360_VIEW_REFERENCE
} from './sources';
import { DMInstanceRef } from '@reveal/utilities';

/**
 * Data contained in a single CoreDM-based annotation
 */
export type CoreDmImage360Annotation = {
  /**
   * The source type of the annotation. Always 'dm'
   */
  sourceType: 'dm';
  /**
   * The DM identifier for this annotation
   */
  annotationIdentifier: DMInstanceRef;
  /**
   * The DM identifier for the asset instance connected to this
   * annotation, if any
   */
  assetRef?: DMInstanceRef;
  /**
   * The Polygon outlining the annotation inside the 360 image
   */
  polygon: Vector3[];
  /**
   * The status of the annotation
   */
  status: 'suggested' | 'approved';
  /**
   * The DM ID of the CdfImage360 to which this annotation is associated
   */
  connectedImageId: DMInstanceRef;
};

export type Image360AnnotationViewReferenceAndProperties = [
  {
    source: typeof CORE_DM_IMAGE_360_ANNOTATION_VIEW_REFERENCE;
    properties: CoreDmImage360AnnotationProperties;
  },
  {
    source: typeof CORE_DM_IMAGE_360_VIEW_REFERENCE;
    properties: CoreDmImage360Properties;
  },
  {
    source: typeof COGNITE_ASSET_VIEW_REFERENCE;
    properties: AssetSimpleProperties;
  }
];
