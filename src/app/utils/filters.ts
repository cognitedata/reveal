import {
  CURRENT_VERSION,
  ANNOTATION_METADATA_PREFIX as PREFIX,
  ANNOTATION_EVENT_TYPE,
} from '@cognite/annotations';
import { ResourceType } from 'lib';

export const annotationFilter = (
  fileId: number,
  resourceType: ResourceType
) => ({
  type: ANNOTATION_EVENT_TYPE,
  metadata: {
    [`${PREFIX}file_id`]: fileId,
    [`${PREFIX}version`]: CURRENT_VERSION,
    [`${PREFIX}resource_type`]: resourceType,
  },
});
