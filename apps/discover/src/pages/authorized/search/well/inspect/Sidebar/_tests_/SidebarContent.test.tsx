import '__mocks/mockContainerAuth'; // should be first
import 'services/wellSearch/__mocks/setupWellsMockSDK';
import 'modules/map/__mocks/mockMapbox';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';
import { getMockUserMe } from 'services/userManagementService/__mocks/mockUmsMe';
import { getMockWellsById } from 'services/wellSearch/__mocks/getMockWellsById';

import { getMockWell } from '__test-utils/fixtures/well/well';
import { getMockWellbore } from '__test-utils/fixtures/well/wellbore';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { SidebarContent } from '../SidebarContent';

describe('SidebarContent tests', () => {
  const mockServer = setupServer(
    getMockUserMe(),
    getMockConfigGet(),
    getMockWellsById()
  );

  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('Should render well and wellbore', async () => {
    const store = getMockedStore({
      wellInspect: {
        selectedWellIds: { 'test-well-1': true },
        selectedWellboreIds: { 'test-well-1': true },
      },
    });

    testRenderer(SidebarContent, store);

    const well = getMockWell();
    const wellbore = getMockWellbore();

    await waitFor(() => {
      expect(screen.getByText(well.name)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(wellbore.name)).toBeInTheDocument();
    });
  });

  it('Should render warning icon for wellbore', async () => {
    const wellbore = getMockWellbore();

    const store = getMockedStore({
      wellInspect: {
        selectedWellIds: { 'test-well-1': true },
        selectedWellboreIds: { 'test-well-1': true },
      },
      inspectTabs: {
        errors: {
          [wellbore.matchingId]: [
            {
              value: 'Some error',
            },
          ],
        },
      },
    });

    testRenderer(SidebarContent, store);
    await waitFor(() => {
      expect(screen.getByLabelText('Warning')).toBeInTheDocument();
    });
    fireEvent.mouseEnter(screen.getByLabelText('Warning'), { bubbles: true });
    await waitFor(() => {
      expect(screen.getByText('Some error')).toBeInTheDocument();
    });
  });
});
