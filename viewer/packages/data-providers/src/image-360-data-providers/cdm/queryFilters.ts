/*!
 * Copyright 2025 Cognite AS
 */
import type { HasExistingDataFilterV3, TableExpressionDataModelsBoolFilter } from '@cognite/sdk';
import {
  COGNITE_3D_OBJECT_CONTAINER_SOURCE,
  COGNITE_VISUALIZABLE_CONTAINER_SOURCE,
  CORE_DM_3D_CONTAINER_SPACE
} from '../../utilities/constants';
import {
  CORE_DM_3D_REVISION_CONTAINER_REFERENCE,
  CORE_DM_IMAGE_360_ANNOTATION_CONTAINER_REFERENCE,
  CORE_DM_IMAGE_360_CONTAINER_REFERENCE,
  CORE_DM_IMAGE_360_STATION_CONTAINER_REFERENCE
} from './sources';

export const isCoreDmImage360CollectionFilter = {
  and: [
    {
      hasData: [CORE_DM_3D_REVISION_CONTAINER_REFERENCE]
    } satisfies HasExistingDataFilterV3,
    {
      equals: {
        property: [CORE_DM_3D_CONTAINER_SPACE, 'Cognite3DRevision', 'type'],
        value: 'Image360'
      }
    }
  ]
} as const satisfies TableExpressionDataModelsBoolFilter;

export const isCoreDm3DRevisionFilter = {
  hasData: [CORE_DM_3D_REVISION_CONTAINER_REFERENCE]
} as const satisfies HasExistingDataFilterV3;

export const isCoreDmImage360Filter = {
  hasData: [CORE_DM_IMAGE_360_CONTAINER_REFERENCE]
} as const satisfies HasExistingDataFilterV3;

export const isCoreDmImage360StationFilter = {
  hasData: [CORE_DM_IMAGE_360_STATION_CONTAINER_REFERENCE]
} as const satisfies HasExistingDataFilterV3;

export const isCoreDmImage360AnnotationFilter = {
  hasData: [CORE_DM_IMAGE_360_ANNOTATION_CONTAINER_REFERENCE]
} as const satisfies HasExistingDataFilterV3;

export const isCoreDmObject3DFilter = {
  hasData: [COGNITE_3D_OBJECT_CONTAINER_SOURCE]
} as const satisfies HasExistingDataFilterV3;

export const isCoreDmVisualizableFilter = {
  hasData: [COGNITE_VISUALIZABLE_CONTAINER_SOURCE]
} as const satisfies HasExistingDataFilterV3;
