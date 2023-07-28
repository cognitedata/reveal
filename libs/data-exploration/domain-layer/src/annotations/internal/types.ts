import { AnnotationModel, CogniteInternalId } from '@cognite/sdk';

import { ResourceType } from '@data-exploration-lib/core';

export interface AnnotationModelInternal extends AnnotationModel {
  resourceId?: CogniteInternalId;
  resourceType?: ResourceType;
}
