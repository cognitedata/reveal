import { screen } from '@testing-library/react';
import render from '@platypus-app/tests/render';
import '@testing-library/jest-dom/extend-expect';
import { Solution as SolutionPage } from './Solution';
import { mockSchemas, mockSolutions } from '@platypus-app/tests/mockData';
import { ActionStatus } from '@platypus-app/types';

const mockSolution = mockSolutions[0];
const mockSchema = mockSchemas[0];

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    solutionId: mockSolution.id,
    version: mockSchema.version,
  }),
}));

jest.mock('./hooks/useSolution', () => ({
  useSolution: () => ({
    fetchSolution: jest.fn(),
    fetchVersions: jest.fn(),
  }),
}));

const solutionReduxMock = {
  solution: mockSolution,
  dataModelStatus: ActionStatus.SUCCESS,
  dataModelError: '',
  selectedSchema: mockSchema,
  schemas: mockSchemas,
  schemasStatus: ActionStatus.SUCCESS,
  schemasError: '',
};

describe('Solution Test', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('Should render page if everything is loaded', async () => {
    render(<SolutionPage />, {
      redux: {
        dataModel: {
          ...solutionReduxMock,
        },
      },
    });

    expect(
      await screen.findByTestId('solution_page_wrapper')
    ).toBeInTheDocument();
  });

  it('Should render no solution placeholder if solution is not loaded', async () => {
    render(<SolutionPage />, {
      redux: {
        dataModel: {
          ...solutionReduxMock,
          dataModelStatus: ActionStatus.FAIL,
        },
      },
    });

    expect(await screen.findByTestId('solution_not_found')).toBeInTheDocument();
  });

  it('Should render no schema placeholder if schema is not loaded', async () => {
    render(<SolutionPage />, {
      redux: {
        dataModel: {
          ...solutionReduxMock,
          schemasStatus: ActionStatus.FAIL,
        },
      },
    });

    expect(await screen.findByTestId('schema_not_found')).toBeInTheDocument();
  });
});
