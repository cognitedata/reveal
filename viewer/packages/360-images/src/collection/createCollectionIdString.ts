/*!
 * Copyright 2025 Cognite AS
 */
import { DataSourceType } from '@reveal/data-providers';
import { isClassicMetadata360Identifier } from '@reveal/data-providers';

export function createCollectionIdString(id: DataSourceType['image360Identifier']): string {
  if (isClassicMetadata360Identifier(id)) {
    return id.site_id;
  } else {
    return `${id.space}/${id.image360CollectionExternalId}`;
  }
}
