/*!
 * Copyright 2024 Cognite AS
 */
import { type Cognite3DViewer } from '@cognite/reveal';

export function getViewerResourceCount(viewer: Cognite3DViewer): number {
  return viewer.models.length + viewer.get360ImageCollections().length;
}
