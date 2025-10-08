import { type ReadonlySignal } from '@cognite/signals';

export type DisposableSignal<T> = {
  signal: ReadonlySignal<() => T>;
  dispose: () => void;
};
