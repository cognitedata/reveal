import render from '@platypus-app/tests/render';
import { Base } from './SolutionsList.stories';
import { screen } from '@testing-library/react';

jest.mock('../hooks/useSolutions', () => ({
  useSolutions: () => ({
    fetchSolutions: jest.fn(),
  }),
}));

describe('SolutionsList', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('Renders correctly', async () => {
    render(<Base />);

    const title = screen.getByText('Solutions');
    expect(title).toBeVisible();

    const cards = screen.getAllByTestId('solution-card');
    expect(cards.length).toBe(2);
  });
});
