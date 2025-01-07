import { Vector3 } from 'three';
import { AssetSimpleProperties, CoreDmImage360AnnotationProperties, CoreDmImage360Properties } from './properties';
import {
  COGNITE_ASSET_VIEW_REFERENCE,
  CORE_DM_IMAGE_360_ANNOTATION_VIEW_REFERENCE,
  CORE_DM_IMAGE_360_VIEW_REFERENCE
} from './sources';
import { DMInstanceRef } from '@reveal/utilities';

export type FdmImage360Annotation = {
  sourceType: 'dm';
  annotationIdentifier?: DMInstanceRef;
  assetRef?: DMInstanceRef;
  polygon: Vector3[];
  status: 'suggested' | 'approved';
  connectedImageId: DMInstanceRef | string;
  uniqueId: number; // Used to identify the annotation in the Architecture. TODO: Should have something much better here
  imagePosition?: Vector3;
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
