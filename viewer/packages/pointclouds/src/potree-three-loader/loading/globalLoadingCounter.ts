/*!
 * Copyright 2022 Cognite AS
 */
let globalNumNodesLoading: number = 0;
const globalMaxNumNodesLoading: number = 10;

export { globalNumNodesLoading, globalMaxNumNodesLoading };

export function incrementGlobalNumNodesLoading() {
  globalNumNodesLoading++;
}

export function decrementGlobalNumNodesLoading() {
  globalNumNodesLoading--;
}
