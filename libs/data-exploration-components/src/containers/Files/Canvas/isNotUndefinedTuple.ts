import { isNotUndefined } from '@data-exploration-lib/core';

export const isNotUndefinedTuple = <T, U>(
  zippedElement: [T | undefined, U | undefined]
): zippedElement is [T, U] =>
  isNotUndefined(zippedElement[0]) && isNotUndefined(zippedElement[1]);
