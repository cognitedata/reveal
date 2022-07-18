export function withDisplayName<T extends (props: any) => JSX.Element>(
  displayName: string,
  Component: T
): T {
  return Object.assign(Component, { displayName });
}
