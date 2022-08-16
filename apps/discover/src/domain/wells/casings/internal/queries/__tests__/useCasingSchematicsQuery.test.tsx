import 'domain/wells/__mocks/setupWellsMockSDK';
import { getMockUserMe } from 'domain/userManagementService/service/__mocks/getMockUserMe';
import { getMockCasingSchematic } from 'domain/wells/casings/service/__fixtures/getMockCasingSchematic';
import { getMockCasingsListPost } from 'domain/wells/casings/service/__mocks/getMockCasingsListPost';
import { getMockCasingsListPostError } from 'domain/wells/casings/service/__mocks/getMockCasingsListPostError';

import { screen } from '@testing-library/react';
import { setupServer } from 'msw/node';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { useCasingSchematicsQuery } from '../useCasingSchematicsQuery';

const mockCasingSchematic = getMockCasingSchematic();

const mockServer = setupServer(
  getMockUserMe({
    preferences: {
      hidden: false,
      measurement: 'feet',
    },
  })
);

describe('useCreateAllWellCollection', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  const TestComponent: React.FC = () => {
    const wellboreIds = [mockCasingSchematic.wellboreMatchingId];
    const { data } = useCasingSchematicsQuery({ wellboreIds });

    return <div>Total: {data?.length}</div>;
  };

  it('should return normalized casing schematics', async () => {
    const store = getMockedStore();
    mockServer.use(getMockCasingsListPost());

    testRenderer(TestComponent, store);

    expect(await screen.findByText('Total: 1')).toBeInTheDocument();
  });

  it('should return empty array for server error', async () => {
    const store = getMockedStore();
    mockServer.use(getMockCasingsListPostError());

    testRenderer(TestComponent, store);

    expect(await screen.findByText('Total: 0')).toBeInTheDocument();
  });
});
