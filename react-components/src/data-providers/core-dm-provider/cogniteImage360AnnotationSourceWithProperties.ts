import { type SourceSelectorV3 } from '@cognite/sdk';
import { COGNITE_IMAGE_360_ANNOTATION_SOURCE } from './dataModels';

export const cogniteImage360AnnotationSourceWithProperties: [{
    readonly source: {
        readonly externalId: "Cognite360ImageAnnotation";
        readonly space: "cdf_cdm";
        readonly version: "v1";
        readonly type: "view";
    };
    readonly properties: ["name", "description", "tags", "aliases", "sourceId", "sourceContext", "source", "sourceCreatedTime", "sourceUpdatedTime", "sourceCreatedUser", "sourceUpdatedUser", "confidence", "status", "polygon", "formatVersion"];
}] = [
  {
    source: COGNITE_IMAGE_360_ANNOTATION_SOURCE,
    properties: [
      'name',
      'description',
      'tags',
      'aliases',
      'sourceId',
      'sourceContext',
      'source',
      'sourceCreatedTime',
      'sourceUpdatedTime',
      'sourceCreatedUser',
      'sourceUpdatedUser',
      'confidence',
      'status',
      'polygon',
      'formatVersion'
    ]
  }
] as const satisfies SourceSelectorV3;
