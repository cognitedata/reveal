/*!
 * Copyright 2021 Cognite AS
 */

/**
 * Removes the readonly modifier for a property.
 */
export type Mutable<T> = { -readonly [P in keyof T]: T[P] };
