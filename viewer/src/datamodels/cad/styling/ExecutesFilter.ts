/*!
 * Copyright 2021 Cognite AS
 */

export interface ExecutesFilter {
  executeFilter: (filter: any) => Promise<void>;
  getFilter: () => any | undefined;
}
