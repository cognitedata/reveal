export {};

type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;

type ValueOf<T> = T[keyof T];
type OneOnly<T, K extends keyof T> = {
  [key in Exclude<keyof T, K>]+?: undefined;
} & Pick<T, K>;
type OneOfByKey<T> = { [key in keyof T]: OneOnly<T, key> };

type NonObjectType = string | number | Date | boolean | Array<any> | undefined;

declare global {
  type DeepKeyOf<T> = Required<T> extends NonObjectType
    ? ''
    : {
        [K in keyof T]: `${Exclude<K, symbol>}${Required<
          Required<T>[K]
        > extends NonObjectType
          ? ''
          : `.${DeepKeyOf<Required<Required<T>[K]>>}`}`;
      }[keyof T];

  type DeepValueOf<
    T,
    K extends DeepKeyOf<T>
  > = K extends `${infer First}.${infer Rest}`
    ? First extends keyof T
      ? Rest extends DeepKeyOf<Required<T>[First]>
        ? DeepValueOf<Required<T>[First], Rest>
        : never
      : never
    : K extends keyof T
    ? T[K]
    : never;

  type OneOf<T> = ValueOf<OneOfByKey<T>>;

  type NonEmpty<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
    U[keyof U];
}
