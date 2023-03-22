import { fireEvent, screen, render } from '@testing-library/react';
import { BaseFilterHeader } from '../BaseFilterHeader';

describe('BaseFilterHeader', () => {
  it('should render filter header', () => {
    render(<BaseFilterHeader title="test title" />);

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('test title')).toBeInTheDocument();
  });

  it('should render tooltip', async () => {
    render(<BaseFilterHeader infoContent="Info content" />);

    fireEvent.mouseEnter(screen.getByTestId('header-info-icon'), {
      bubbles: true,
    });
    expect(screen.getByText('Info content')).toBeInTheDocument();
  });
});
