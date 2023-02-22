import { screen } from '@testing-library/react';
import render from '@platypus-app/tests/render';
import '@testing-library/jest-dom/extend-expect';
import { DataModel } from './DataModel';
import { mockSchemas, mockSolutions } from '@platypus-app/tests/mockData';
import {
  useDataModel,
  useDataModelVersions,
  useSelectedDataModelVersion,
} from '@platypus-app/hooks/useDataModelActions';
import {
  DataModelReducerState,
  initialState,
} from '@platypus-app/redux/reducers/global/dataModelReducer';
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

jest.mock('@platypus-app/hooks/useDataModelActions');

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
        data: mockSchema,
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
    (useDataModelVersions as any).mockImplementation(() => {
      return {
        data: mockSchemas,
        isLoading: true,
        isError: false,
        isSuccess: true,
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
    (useDataModelVersions as any).mockImplementation(() => {
      return {
        isLoading: false,
        isError: true,
        isSuccess: false,
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
    (useDataModelVersions as any).mockImplementation(() => {
      return {
        data: mockSchemas,
        isLoading: false,
        isError: true,
        isSuccess: false,
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
