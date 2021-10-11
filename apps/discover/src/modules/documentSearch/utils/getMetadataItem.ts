import get from 'lodash/get';

import { Document } from '@cognite/sdk-playground';

export const getMetadataItem = (item: Document, key: string) =>
  get(item.sourceFile, `metadata.${key}`);
