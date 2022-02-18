import { screen, fireEvent } from '@testing-library/react';
import { PartialStoreState } from 'core';
import { setupServer } from 'msw/node';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';
import { getMockUserMe } from 'services/userManagementService/__mocks/mockUmsMe';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { LOADING_TEXT } from 'components/emptyState/constants';
import { showErrorMessage } from 'components/toast';
// import { useCasingsForTable } from 'modules/wellSearch/selectors';

import Casing from '../Casing';

const showErrorMessageMock = jest.fn();
jest.mock('components/toast', () => ({
  showErrorMessage: jest.fn(),
}));

const defaultStore = {
  filterData: {
    casing: {
      selectedIds: {},
    },
  },
};

const networkMocks = setupServer(getMockConfigGet(), getMockUserMe());

describe('Casing', () => {
  beforeAll(() => networkMocks.listen());
  afterAll(() => networkMocks.close());

  beforeEach(() => {
    // (useCasingsForTable as jest.Mock).mockImplementation(() => ({
    //   casings: [],
    //   isLoading: true,
    // }));
    (showErrorMessage as jest.Mock).mockImplementation(showErrorMessageMock);
  });

  afterEach(() => {
    // (useCasingsForTable as jest.Mock).mockClear();
    (showErrorMessage as jest.Mock).mockClear();
    jest.clearAllMocks();
  });

  const testInit = async (extraState: PartialStoreState = {}) =>
    testRenderer(Casing, getMockedStore({ ...defaultStore, ...extraState }));

  it('should display loader on casing loading', async () => {
    await testInit();
    expect(screen.getByText(LOADING_TEXT)).toBeInTheDocument();
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should display error message when clicks on preview if no casings are selected', async () => {
    // (useCasingsForTable as jest.Mock).mockImplementation(() => ({
    //   casings: [
    //     {
    //       id: 1,
    //     },
    //   ],
    //   isLoading: false,
    // }));

    await testInit();
    const button = screen.getByTestId('preview-button');
    fireEvent.click(button);
    expect(showErrorMessageMock).toBeCalledTimes(1);
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should preview selected casings on preview button click', async () => {
    // (useCasingsForTable as jest.Mock).mockImplementation(() => ({
    //   casings: [
    //     {
    //       id: 1,
    //       casings: [],
    //     },
    //   ],
    //   isLoading: false,
    // }));
    await testInit({
      filterData: {
        casing: {
          selectedIds: {
            1: true,
          },
        },
      },
    });
    const button = screen.getByTestId('preview-button');
    fireEvent.click(button);
    expect(screen.getByTestId('casing-preview-content')).toBeInTheDocument();
  });
});
