/*!
 * Copyright 2022 Cognite AS
 */

import clone from 'lodash/clone';

export async function thisIsAWorkerTest(): Promise<number> {
  const dfg = clone({ asd: 8688483.0 });
  return Promise.resolve(dfg.asd);
}
