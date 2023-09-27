import { cluster, project } from '../utils/config';

export function interceptProfileMe() {
  cy.intercept(
    'GET',
    `https://${cluster}/api/v1/projects/${project}/profiles/me`,
    {
      userIdentifier: 'test-user',
      givenName: 'Test',
      surname: 'User',
      email: 'test.user@cognite.com',
      displayName: 'Test User',
      jobTitle: 'Test Bot',
      lastUpdatedTime: 12345,
    }
  );
}
