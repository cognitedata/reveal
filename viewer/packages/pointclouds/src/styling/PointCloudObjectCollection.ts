/*!
 * Copyright 2022 Cognite AS
 */

export interface PointCloudObjectCollection {
  getAnnotationIds(): Iterable<number>;

  get isLoading(): boolean;

  on(event: 'changed'): void;
  off(event: 'changed'): void;
}
