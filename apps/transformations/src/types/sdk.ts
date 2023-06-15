export type SdkListData<T> = {
  items: T[];
  nextCursor?: string;
};
export type TransformationListQueryParams = {
  includePublic: boolean;
  limit: number;
};

export type SetNull = {
  setNull: true;
};

export type SetValue<T> = {
  set: T;
};

export type SetNullOrValue<T> = SetNull | SetValue<T>;

export type UpdateValues<V, N = any> = {
  update: {
    [VKey in keyof V]: SetValue<V[VKey]>;
  } & {
    [NKey in keyof N]: SetNullOrValue<N[NKey]>;
  };
};

export type UpdateItemWithId<V, N = any> = UpdateValues<V, N> & {
  id: number;
};
