/*!
 * Copyright 2020 Cognite AS
 */

export type ModelColorDelegate = (treeIndex: number) => [number, number, number, number] | undefined;
export type ModelVisibilityDelegate = (treeIndex: number) => boolean;

export interface ModelNodeAppearance {
  color?: ModelColorDelegate;
  visible?: ModelVisibilityDelegate;
}
