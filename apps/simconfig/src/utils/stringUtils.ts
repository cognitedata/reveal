/* eslint-disable no-bitwise */

/** Replace all characters except for alphanumeric characters, dashes and periods with underscores */
export const sanitizeValue = (value: string) =>
  value.replace(/[^-.\w]+/g, '_').replace('/', '_');

/** DJB2a non-cryptographic hash function */
export const hashCode = (input: string) =>
  Array.from(input).reduce(
    (hash, char) => 0 | ((33 * hash) ^ char.charCodeAt(0)),
    5381
  );
