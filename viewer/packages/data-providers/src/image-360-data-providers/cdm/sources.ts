import { ViewReference } from '@cognite/sdk';
import { CORE_DM_SPACE } from '../../utilities/constants';

export const COGNITE_ASSET_VIEW_REFERENCE = {
  type: 'view',
  externalId: 'CogniteAsset',
  space: CORE_DM_SPACE,
  version: 'v1'
} as const satisfies ViewReference;

export const COGNITE_OBJECT_3D_VIEW_REFERENCE = {
  type: 'view',
  externalId: 'Cognite3DObject',
  space: CORE_DM_SPACE,
  version: 'v1'
} as const satisfies ViewReference;

export const COGNITE_VISUALIZABLE_VIEW_REFERENCE = {
  type: 'view',
  externalId: 'CogniteVisualizable',
  space: CORE_DM_SPACE,
  version: 'v1'
} as const satisfies ViewReference;

export const CORE_DM_IMAGE_360_VIEW_REFERENCE = {
  type: 'view',
  space: CORE_DM_SPACE,
  externalId: 'Cognite360Image',
  version: 'v1'
} as const satisfies ViewReference;

export const CORE_DM_IMAGE_360_COLLECTION_VIEW_REFERENCE = {
  type: 'view',
  space: CORE_DM_SPACE,
  externalId: 'Cognite360ImageCollection',
  version: 'v1'
} as const satisfies ViewReference;

export const CORE_DM_IMAGE_360_ANNOTATION_VIEW_REFERENCE = {
  type: 'view',
  space: CORE_DM_SPACE,
  externalId: 'Cognite360ImageAnnotation',
  version: 'v1'
} as const satisfies ViewReference;

export const CORE_DM_3D_REVISION_VIEW_REFERENCE = {
  type: 'view',
  space: CORE_DM_SPACE,
  externalId: 'Cognite3DRevision',
  version: 'v1'
} as const satisfies ViewReference;
