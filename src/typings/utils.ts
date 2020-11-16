export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends readonly (infer U)[]
    ? readonly DeepPartial<U>[]
    : DeepPartial<T[P]>;
};

export type ValueOf<T> = T[keyof T];

export type PickValueOf<T, V extends keyof T> = ValueOf<Pick<T, V>>;
