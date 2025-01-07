/*!
 * Copyright 2025 Cognite AS
 */
import {
  AssetSimpleProperties,
  CoreDmImage360AnnotationProperties,
  CoreDmImage360CollectionProperties,
  CoreDmImage360Properties
} from './properties';

export const ASSET_SIMPLE_PROPERTIES_LIST = [
  'name',
  'description',
  'object3D'
] as const satisfies (keyof AssetSimpleProperties)[];

export const CORE_DM_IMAGE_360_COLLECTION_PROPERTIES_LIST = [
  'name'
] as const satisfies (keyof CoreDmImage360CollectionProperties)[];

export const CORE_DM_IMAGE_360_PROPERTIES_LIST = [
  'translationX',
  'translationY',
  'translationZ',
  'eulerRotationX',
  'eulerRotationY',
  'eulerRotationZ',
  'scaleX',
  'scaleY',
  'scaleZ',
  'front',
  'back',
  'left',
  'right',
  'top',
  'bottom',
  'collection360',
  'station360',
  'takenAt'
] as const satisfies (keyof CoreDmImage360Properties)[];

export const CORE_DM_IMAGE_360_ANNOTATIONS_PROPERTIES_LIST = [
  'polygon',
  'formatVersion'
] as const satisfies (keyof CoreDmImage360AnnotationProperties)[];
