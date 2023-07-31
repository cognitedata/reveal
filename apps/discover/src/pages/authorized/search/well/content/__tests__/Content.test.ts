import '__mocks/mockCogniteSDK';
import { getMockConfigGet } from 'domain/projectConfig/service/__mocks/getMockConfigGet';
import { getMockUserMe } from 'domain/userManagementService/service/__mocks/getMockUserMe';

import { screen } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { Store } from 'redux';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { NO_RESULTS_TEXT } from 'components/Loading/constants';
import { initialState as wellState } from 'modules/wellSearch/reducer';
import { WellState } from 'modules/wellSearch/types';

import Content from '../Content';

const mockServer = setupServer(getMockUserMe(), getMockConfigGet());

describe('Well content', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  const page = (viewStore: Store, viewProps?: any) =>
    testRenderer(Content, viewStore, viewProps);

  const defaultTestInit = async (extra: WellState = wellState) => {
    const store = getMockedStore({ wellSearch: { ...extra } });
    return { ...page(store), store };
  };

  it(`should render loading state at the start`, async () => {
    await defaultTestInit();

    expect(screen.getByText(NO_RESULTS_TEXT)).toBeInTheDocument();
  });
});
