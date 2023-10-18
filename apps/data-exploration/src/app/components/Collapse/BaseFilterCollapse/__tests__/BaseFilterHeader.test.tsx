import { fireEvent, screen } from '@testing-library/react';

import render from '../../../../../testUtils/render';
import { BaseFilterHeader } from '../BaseFilterHeader';

describe('BaseFilterHeader', () => {
  it('should render filter header', () => {
    render(BaseFilterHeader, undefined, { title: 'test title' });

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('test title')).toBeInTheDocument();
  });

  it('should render tooltip', async () => {
    render(BaseFilterHeader, undefined, { infoContent: 'Info content' });

    fireEvent.mouseEnter(screen.getByTestId('header-info-icon'), {
      bubbles: true,
    });
    expect(screen.getByText('Info content')).toBeInTheDocument();
  });
});