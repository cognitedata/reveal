import some from 'lodash/some';

import { MetadataValue } from '../types';

export const isLeaf = (metadata: MetadataValue) =>
  !some(metadata.children, 'children') && !metadata.dataAsChildren;
