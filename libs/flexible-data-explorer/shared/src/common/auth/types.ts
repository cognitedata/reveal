export type AuthStateUser = {
  id: number | string;
  name: string;
  email: string;
  idToken: string;
};

export type AuthStateAuthenticated = {
  status: 'AUTHENTICATED';
  user: AuthStateUser;
};
