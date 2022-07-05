export type APIState<T> = {
  loading: boolean;
  error?: any;
  data?: T;
};
