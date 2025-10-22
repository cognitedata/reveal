import { type SourceSelectorV3 } from '@cognite/sdk';
import { COGNITE_IMAGE_360_SOURCE } from './dataModels';

export const cogniteImage360SourceWithOnlyCollection360: [{
    readonly source: {
        readonly externalId: "Cognite360Image";
        readonly space: "cdf_cdm";
        readonly version: "v1";
        readonly type: "view";
    };
    readonly properties: ["collection360"];
}] = [
  {
    source: COGNITE_IMAGE_360_SOURCE,
    properties: ['collection360']
  }
] as const satisfies SourceSelectorV3;

export const cogniteImage360SourceWithProperties: [{
    readonly source: {
        readonly externalId: "Cognite360Image";
        readonly space: "cdf_cdm";
        readonly version: "v1";
        readonly type: "view";
    };
    readonly properties: ["translationX", "translationY", "translationZ", "eulerRotationX", "eulerRotationY", "eulerRotationZ", "scaleX", "scaleY", "scaleZ", "front", "back", "left", "right", "top", "bottom", "collection360", "station360", "takenAt"];
}] = [
  {
    source: COGNITE_IMAGE_360_SOURCE,
    properties: [
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
    ]
  }
] as const satisfies SourceSelectorV3;
