/*!
 * Copyright 2024 Cognite AS
 */

import { type TableExpressionEqualsFilterV3 } from '@cognite/sdk';

export function getNodeExternalIdEqualsFilter<T extends string>(
  externalId: T
): TableExpressionEqualsFilterV3 {
  return {
    equals: {
      property: ['node', 'externalId'],
      value: externalId
    }
  } as const satisfies TableExpressionEqualsFilterV3;
}

export function getNodeSpaceEqualsFilter<T extends string>(
  space: T
): TableExpressionEqualsFilterV3 {
  return {
    equals: {
      property: ['node', 'space'],
      value: space
    }
  } as const satisfies TableExpressionEqualsFilterV3;
}
