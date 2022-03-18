let globalNumNodesLoading: number = 0;
const globalMaxNumNodesLoading: number = 10;

export { globalNumNodesLoading, globalMaxNumNodesLoading };

export function incrementGlobalNumNodesLoading(): void {
  globalNumNodesLoading++;
}

export function decrementGlobalNumNodesLoading(): void {
  globalNumNodesLoading--;
}
