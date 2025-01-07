/*!
 * Copyright 2025 Cognite AS
 */
import { DataSourceType } from '@reveal/data-providers';
import {
  isCoreDmImage360Identifier,
  isLegacyDM360Identifier
} from '@reveal/data-providers/src/image-360-data-providers/shared';

export function createCollectionIdString(id: DataSourceType['image360Identifier']): string {
  if (isCoreDmImage360Identifier(id) || isLegacyDM360Identifier(id)) {
    return `${id.space}/${id.image360CollectionExternalId}`;
  } else {
    return id.site_id;
  }
}
