import '__mocks/mockContainerAuth'; // should be first
import 'domain/wells/__mocks/setupWellsMockSDK';
import 'modules/map/__mocks/mockMapbox';
import { getMockConfigGet } from 'domain/projectConfig/service/__mocks/getMockConfigGet';
import { getMockUserMe } from 'domain/userManagementService/service/__mocks/getMockUserMe';
import { getMockWell } from 'domain/wells/well/service/__fixtures/well';
import { getMockWellsById } from 'domain/wells/well/service/__mocks/getMockWellsById';
import { getMockWellbore } from 'domain/wells/wellbore/service/__fixtures/wellbore';

import { screen, waitFor, fireEvent } from '@testing-library/react';
import { setupServer } from 'msw/node';

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
              message: 'Some error',
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
