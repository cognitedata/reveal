import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import {
  DefaultSolutionCard,
  SolutionCardWithoutOwners,
} from './SolutionCard.stories';

describe('SolutionCard', () => {
  it('Should render default solution card', async () => {
    render(<DefaultSolutionCard />);
    const menu = screen.getAllByRole('menu');
    expect(menu.length).toBe(1);
    const headers = screen.getAllByRole('heading', { level: 5 });
    expect(headers.length).toBe(1);
    expect(screen.getByRole('heading')).toHaveTextContent('BestDay');
    expect(screen.queryByText('BestDay')).not.toBeNull();
    expect(screen.queryByText('No owners')).toBeNull();
    expect(screen.getByRole('definition')).toBeInTheDocument();
    expect(screen.getByRole('definition')).toHaveTextContent('1.2');
  });

  it('Should render a solution card without owners and default version', async () => {
    render(<SolutionCardWithoutOwners />);
    const menu = screen.getAllByRole('menu');
    expect(menu.length).toBe(1);
    const headers = screen.getAllByRole('heading', { level: 5 });
    expect(headers.length).toBe(1);
    expect(screen.getByRole('heading')).toHaveTextContent('Equipments');
    expect(screen.queryByText('No owners')).not.toBeNull();
    expect(screen.getByRole('definition')).toBeInTheDocument();
    expect(screen.getByRole('definition')).toHaveTextContent('1.0');
    expect(screen.getByRole('definition')).toHaveClass('version');
  });
});
