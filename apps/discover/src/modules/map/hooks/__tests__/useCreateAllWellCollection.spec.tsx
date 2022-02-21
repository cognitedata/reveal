import 'services/well/__mocks/setupWellsMockSDK';
import { screen } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';
import { getMockWellsGeometry } from 'services/well/__mocks/mockWellsGeometry';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { useCreateAllWellCollection } from '../useCreateAllWellCollection';

const mockServer = setupServer(getMockWellsGeometry(), getMockConfigGet());

describe('useCreateAllWellCollection', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should work ok', async () => {
    const store = getMockedStore();

    const TestComponent: React.FC = () => {
      const data = useCreateAllWellCollection({
        selectedWellIds: { '1': true },
      });
      return <div>Total: {data.features.length}</div>;
    };

    testRenderer(TestComponent, store);

    expect(await screen.findByText('Total: 1')).toBeInTheDocument();
  });

  it('should pass in properties of selection to well feature state', async () => {
    const store = getMockedStore();

    const TestComponent: React.FC = () => {
      const data = useCreateAllWellCollection({
        selectedWellIds: {},
      });

      return (
        <div>
          {
            data.features.filter(
              ({ properties }) => properties?.isSelected === 'true'
            ).length
          }
        </div>
      );
    };

    testRenderer(TestComponent, store);

    expect(await screen.findByText('0')).toBeInTheDocument();
  });
});
