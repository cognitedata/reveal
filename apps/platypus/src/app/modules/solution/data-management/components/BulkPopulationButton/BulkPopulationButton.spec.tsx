import { screen } from '@testing-library/react';
import render from '@platypus-app/tests/render';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { BulkPopulationButton } from './BulkPopulationButton';

const mockGetMissingPermissions = jest.fn();
const mockSetIsTransformationModalOpen = jest.fn();

jest.mock(
  '@platypus-app/modules/solution/data-management/hooks/useDataManagemenPageUI',
  () => ({
    useDataManagementPageUI: () => ({
      setIsTransformationModalOpen: mockSetIsTransformationModalOpen,
      getMissingPermissions: mockGetMissingPermissions,
    }),
  })
);

jest.mock('@platypus-app/hooks/useDataModelActions', () => ({
  useDataModelVersions: () => ({
    data: [],
  }),
  useSelectedDataModelVersion: () => ({
    version: '1',
  }),
}));

const mockMutate = jest.fn().mockImplementation((transformation, options) => {
  options.onSuccess({ id: transformation.transformationExternalId });
});

jest.mock(
  '@platypus-app/modules/solution/data-management/hooks/useTransformationCreateMutation',
  () => () => ({
    mutate: mockMutate,
  })
);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({ dataModelExternalId: 'abc' }),
}));

const mockReduxStore = {
  dataModel: {
    selectedVersionNumber: '1',
  },
  dataManagement: {
    selectedType: {
      fields: [],
      name: 'Movie',
    },
  },
};

describe('BulkPopulationButton', () => {
  beforeAll(() => {
    mockMutate.mockClear();
    mockSetIsTransformationModalOpen.mockClear();
  });

  it('shows tooltip if there are missing permissions', () => {
    mockGetMissingPermissions.mockImplementation(() => ['foo']);

    render(<BulkPopulationButton />, {
      redux: mockReduxStore,
    });

    userEvent.hover(screen.getByRole('button'));

    expect(screen.getByText(/You do not have enough permissions/)).toBeTruthy();
  });

  it('does not show tooltip if there are no missing permissions', () => {
    mockGetMissingPermissions.mockImplementation(() => []);

    render(<BulkPopulationButton />, {
      redux: mockReduxStore,
    });

    userEvent.hover(screen.getByRole('button'));

    expect(screen.queryByText(/You do not have enough permissions/)).toBeNull();
  });

  it('calls mutation to create transformation when user clicks', () => {
    const mockTransformation = {
      dataModelExternalId: 'abc',
      transformationExternalId: 't_abc_Movie_1_1',
      transformationName: 'Movie_1 1',
      typeName: 'Movie',
      version: '1',
    };

    render(<BulkPopulationButton />, {
      redux: mockReduxStore,
    });

    userEvent.click(screen.getByRole('button'));

    expect(mockMutate.mock.calls[0][0]).toEqual(mockTransformation);
    expect(mockSetIsTransformationModalOpen).toHaveBeenCalledWith(
      true,
      't_abc_Movie_1_1'
    );
  });
});
