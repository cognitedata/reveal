/*!
 * Copyright 2020 Cognite AS
 */

export type ColorDelegate = (treeIndex: number) => [number, number, number, number] | undefined;
export type VisibilityDelegate = (treeIndex: number) => boolean;

export interface NodeProperties {
  color?: ColorDelegate;
  visible?: VisibilityDelegate;
}
