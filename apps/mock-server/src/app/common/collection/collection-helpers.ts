/* eslint-disable @typescript-eslint/no-explicit-any */
import { Predicate } from './types';

/**
 * Checks if the argument passed is an object
 */
// eslint-disable-next-line lodash/prefer-lodash-typecheck
export const isObj = <T>(x: T): boolean => !!x && typeof x === 'object';

/**
 * Determine if two objects are equal
 */
export const equal = <T, U>(a: T, b: U): boolean => {
  const entries = objectEntries(a);
  return entries.every(([key, val]) =>
    // eslint-disable-next-line
    // @ts-ignore
    isObj(val) ? equal(b[key], val) : b[key] === val
  );
};

function objectEntries(obj: any): Array<any> {
  let ownProps, i, resArray;
  (ownProps = Object.keys(obj)),
    (i = ownProps.length),
    (resArray = new Array(i)); // preallocate the Array

  while (i--) {
    resArray[i] = [ownProps[i], obj[ownProps[i]]];
  }

  return resArray;
}

export const keyComparer =
  <T>(
    _keySelector: (key: T) => any,
    descending?: boolean
  ): ((a: T, b: T) => number) =>
  (a: T, b: T) => {
    const sortKeyA = _keySelector(a);
    const sortKeyB = _keySelector(b);
    if (sortKeyA > sortKeyB) {
      return !descending ? 1 : -1;
    } else if (sortKeyA < sortKeyB) {
      return !descending ? -1 : 1;
    } else {
      return 0;
    }
  };

/**
 * Creates a function that negates the result of the predicate
 */
export const negate =
  <T>(predicate: Predicate<T>): any =>
  // eslint-disable-next-line
  // @ts-ignore
  (...args) =>
    !predicate(...args);
