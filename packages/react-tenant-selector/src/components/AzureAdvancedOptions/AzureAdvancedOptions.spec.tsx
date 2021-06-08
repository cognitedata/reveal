import { fireEvent, screen } from '@testing-library/react';

import { render } from '../../utils/test';

import { Base } from './AzureAdvancedOptions.stories';

describe('<AzureAdvancedOptions />', () => {
  it('Should expand correctly, and correctly set local storage', () => {
    render(<Base />);
    expect(screen.getByText('Advanced Azure options')).toBeInTheDocument();
    expect(screen.queryByText('Azure tenant')).not.toBeInTheDocument();

    // Expands to show data
    fireEvent.click(screen.getByText('Advanced Azure options'));
    expect(screen.getByText('Azure tenant')).toBeInTheDocument();
  });
});
