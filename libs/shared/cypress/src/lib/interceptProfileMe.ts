export type Profile = {
  userIdentifier: string;
  givenName: string;
  surname: string;
  email: string;
  displayName: string;
  jobTitle: string;
  lastUpdatedTime: number;
};

export function interceptProfileMe(
  cluster: string,
  project: string,
  profile: Profile = {
    userIdentifier: 'test-user',
    givenName: 'Test',
    surname: 'User',
    email: 'test.user@cognite.com',
    displayName: 'Test User',
    jobTitle: 'Test Bot',
    lastUpdatedTime: 12345,
  }
) {
  cy.intercept(
    'GET',
    `https://${cluster}/api/v1/projects/${project}/profiles/me`,
    profile
  );
}
