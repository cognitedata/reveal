/*!
 * Copyright 2022 Cognite AS
 */

/**
 * Retrieves the property type of a single property of a type.
 */
export type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];
