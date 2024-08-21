/*!
 * Copyright 2024 Cognite AS
 */
export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends ReadonlyArray<infer ElementType> ? ElementType : never;

export type PromiseType<PromiseType extends Promise<unknown>> =
  PromiseType extends Promise<infer ElementType> ? ElementType : never;
