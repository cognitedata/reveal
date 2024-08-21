/*!
 * Copyright 2024 Cognite AS
 */

export function mergeQueryResults<T extends Record<string, unknown[]>>(dst: T, src: T): T {
  [...Object.keys(src)].forEach((key0) => {
    if (!(key0 in dst)) {
      Object.assign(dst, key0, []);
    }

    dst[key0].push(...src[key0]);
  });

  return dst;
}
