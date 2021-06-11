export function withDisplayName<T extends React.ReactNode>(
  displayName: string,
  Component: T
): T {
  return Object.assign(Component, { displayName });
}
