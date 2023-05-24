import { screen } from '@testing-library/react';
import render from '@platypus-app/tests/render';
import '@testing-library/jest-dom/extend-expect';
import { mockSchemas, mockSolutions } from '@platypus-app/tests/mockData';
import {
  useDataModel,
  useDataModelVersions,
} from '@platypus-app/hooks/useDataModelActions';
import { useSelectedDataModelVersion } from '@platypus-app/hooks/useSelectedDataModelVersion';
import {
  DataModelReducerState,
  initialState,
} from '@platypus-app/redux/reducers/global/dataModelReducer';
import { DataModel } from './DataModel';
import { DataLayout } from './DataLayout';

const mockSolution = mockSolutions[0];
const mockSchema = mockSchemas[0];

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    dataModelExternalId: mockSolution.id,
    version: mockSchema.version,
  }),
}));
jest.mock('@platypus-app/hooks/useMixpanel', () => ({
  useMixpanel: () => ({
    track: jest.fn(),
  }),
}));

jest.mock('@platypus-app/hooks/useDataModelActions');
jest.mock('@platypus-app/hooks/useSelectedDataModelVersion');

jest.mock('@platypus-app/components/DataModelLibrary/DataModelLibrary', () => {
  return {
    DataModelLibrary: () => <p>Mock</p>,
  };
});

const solutionReduxMock = {
  ...initialState,
  dataModel: mockSolution,
  selectedVersion: mockSchema,
  versions: mockSchemas,
} as DataModelReducerState;

describe('DataModelPage Test', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetModules();
  });

  it('Should render page if everything is loaded', async () => {
    (useDataModel as any).mockImplementation(() => {
      return {
        data: mockSolution,
        isLoading: false,
        isError: false,
        isSuccess: true,
      };
    });
    (useDataModelVersions as any).mockImplementation(() => {
      return {
        data: mockSchemas,
        isLoading: false,
        isError: false,
        isSuccess: true,
      };
    });

    (useSelectedDataModelVersion as any).mockImplementation(() => {
      return {
        dataModelVersion: mockSchema,
        isLoading: false,
        isError: false,
        isSuccess: true,
      };
    });

    render(<DataLayout />, {
      redux: {
        dataModel: {
          ...solutionReduxMock,
        },
      },
    });

    expect(
      await screen.findByTestId('data_model_page_wrapper')
    ).toBeInTheDocument();
  });

  it('Should show loader while loading', async () => {
    (useDataModel as any).mockImplementation(() => {
      return {
        data: mockSolution,
        isLoading: true,
        isError: false,
        isSuccess: true,
      };
    });
    (useSelectedDataModelVersion as any).mockImplementation(() => {
      return {
        data: undefined,
        isLoading: true,
        isError: false,
      };
    });

    render(<DataModel />, {
      redux: {
        dataModel: {
          ...solutionReduxMock,
        },
      },
    });

    expect(await screen.findByTestId('data_model_loader')).toBeInTheDocument();
  });

  it('Should render no data model not found', async () => {
    (useSelectedDataModelVersion as any).mockImplementation(() => {
      return {
        isLoading: false,
        error: {
          message: 'data model cant be found',
        },
      };
    });

    render(<DataModel />, {
      redux: {
        dataModel: {
          ...solutionReduxMock,
        },
      },
    });

    expect(await screen.findByTestId('data_model_not_found')).toHaveTextContent(
      'data model'
    );
  });

  it('Should render no data model placeholder if it is not loaded', async () => {
    (useSelectedDataModelVersion as any).mockImplementation(() => {
      return {
        dataModelVersion: undefined,
        isLoading: false,
        error: {
          message: 'space cant be found',
        },
      };
    });

    render(<DataModel />, {
      redux: {
        dataModel: {
          ...solutionReduxMock,
        },
      },
    });

    expect(await screen.findByTestId('data_model_not_found')).toHaveTextContent(
      'space'
    );
  });
});
