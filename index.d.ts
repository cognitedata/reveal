export {};

type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;

type ValueOf<T> = T[keyof T];
type OneOnly<T, K extends keyof T> = {
  [key in Exclude<keyof T, K>]+?: undefined;
} & Pick<T, K>;
type OneOfByKey<T> = { [key in keyof T]: OneOnly<T, key> };

declare global {
  type DeepKeyOf<T> = (
    T extends object
      ? {
          [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<DeepKeyOf<T[K]>>}`;
        }[Exclude<keyof T, symbol>]
      : ''
  ) extends infer D
    ? Extract<D, string>
    : never;

  type OneOf<T> = ValueOf<OneOfByKey<T>>;
}
