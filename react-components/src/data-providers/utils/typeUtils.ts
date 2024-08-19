// From https://stackoverflow.com/questions/41253310/typescript-retrieve-element-type-information-from-array-type
export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type PromiseType<PromiseType extends Promise<unknown>> =
  PromiseType extends Promise<infer ElementType> ? ElementType : never;
