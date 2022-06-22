import { screen } from '@testing-library/react';
import render from '@platypus-app/tests/render';
import '@testing-library/jest-dom/extend-expect';
import { DataModel } from './DataModel';
import { mockSchemas, mockSolutions } from '@platypus-app/tests/mockData';
import {
  useDataModel,
  useDataModelVersions,
} from '@platypus-app/hooks/useDataModelActions';

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
  dataModel: mockSolution,
  selectedVersion: mockSchema,
  versions: mockSchemas,
};

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

    render(<DataModel />, {
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

  it('Should render no data model placeholder if it is not loaded', async () => {
    (useDataModel as any).mockImplementation(() => {
      return {
        data: mockSolution,
        isLoading: false,
        isError: true,
        isSuccess: true,
      };
    });
    (useDataModelVersions as any).mockImplementation(() => {
      return {
        data: mockSchemas,
        isLoading: false,
        isError: true,
        isSuccess: false,
      };
    });

    render(<DataModel />, {
      redux: {
        dataModel: {
          ...solutionReduxMock,
        },
      },
    });

    expect(
      await screen.findByTestId('data_model_not_found')
    ).toBeInTheDocument();
  });
});
