import '__mocks/mockCogniteSDK';

import { getMockTokenInspect } from 'domain/capabilities/service/__mocks/mockTokenInspect';

import { screen } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';

import { testRenderer } from '__test-utils/renderer';

import { UserAccessList } from '../UserAccessList';

const mockServer = setupServer(getMockConfigGet(), getMockTokenInspect());

describe('UserAccessList', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should find missing files', () => {
    testRenderer(UserAccessList);

    expect(screen.getByText('Show my access')).toBeInTheDocument();
  });
});
