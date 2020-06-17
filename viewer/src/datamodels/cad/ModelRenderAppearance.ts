/*!
 * Copyright 2020 Cognite AS
 */

export type NodeFrontRenderDelegate = (treeIndex: number) => boolean;
export type NodeBorderDelegate = (treeIndex: number) => NodeBorderMetadata;

export type NodeBorderMetadata = {
  color: [number, number, number, number];
  width: number;
};

export interface ModelRenderAppearance {
  renderInFront?: NodeFrontRenderDelegate;
  renderBorder?: NodeBorderDelegate;
}
