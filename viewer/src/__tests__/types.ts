/*!
 * Copyright 2020 Cognite AS
 */

/**
 * Retrieves the property type of a single property of a type.
 */
export type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];
/**
 * Removes the readonly modifier for a property.
 */
export type Mutable<T> = { -readonly [P in keyof T]: T[P] };
