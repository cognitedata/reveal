/*!
 * Copyright 2024 Cognite AS
 */

export type LegacyIdentifier = {
  sourceType: 'classic';
  id: number;
};

export type FdmIdentifier = {
  sourceType: 'dm';
  space: string;
  externalId: string;
};

export type AnnotationIdentifier = LegacyIdentifier | FdmIdentifier;

export type AssetIdentifier = LegacyIdentifier | FdmIdentifier;

export type AnnotationStatus = 'suggested' | 'saved' | 'pending' | 'deleted';
