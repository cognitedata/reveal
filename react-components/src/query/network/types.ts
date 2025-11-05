import { AnnotationsInstanceRef, IdEither, type ViewDefinition } from '@cognite/sdk';

export type DMSView = {
  rawView: ViewDefinition;
};

export type ClassicAnnotationIdAndAssetReference = {
  assetReference: IdEither | AnnotationsInstanceRef;
  annotationId: number;
};
