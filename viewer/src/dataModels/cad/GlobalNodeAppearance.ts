/*!
 * Copyright 2020 Cognite AS
 */

export type GlobalColorDelegate = (
  modelIdentifier: string,
  treeIndex: number
) => [number, number, number, number] | undefined;
export type GlobalVisibilityDelegate = (modelIdentifier: string, treeIndex: number) => boolean;

export interface GlobalNodeAppearance {
  color?: GlobalColorDelegate;
  visible?: GlobalVisibilityDelegate;
}
