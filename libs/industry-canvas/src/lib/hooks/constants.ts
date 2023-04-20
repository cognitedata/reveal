import { ContainerType } from '@cognite/unified-file-viewer';
import { IndustryCanvasContainerConfig } from '../types';

export const EMPTY_FLEXIBLE_LAYOUT: IndustryCanvasContainerConfig = {
  id: 'flexible-layout-container',
  type: ContainerType.FLEXIBLE_LAYOUT,
  children: [],
  metadata: {},
};

export const EMPTY_ARRAY = [];
