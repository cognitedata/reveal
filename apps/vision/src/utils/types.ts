export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export interface AccessPermission {
  acl: string;
  actions: string[];
  scope?: { type: string; value: string };
}
