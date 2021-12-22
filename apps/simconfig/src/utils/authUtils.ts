import type { AuthenticatedUser } from '@cognite/auth-utils';

export const isAuthenticated = (
  authState?: AuthenticatedUser
): authState is AuthenticatedUser &
  Pick<Required<AuthenticatedUser>, 'email' | 'project'> =>
  authState?.email !== undefined && authState.project !== undefined;
