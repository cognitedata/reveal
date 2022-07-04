import { Configuration, OperationsApi } from '@cognite/calculation-backend';

export function fetchOperations(
  config: Configuration,
  ...args: Parameters<OperationsApi['getOperations']>
) {
  return new OperationsApi(config).getOperations(...args);
}
