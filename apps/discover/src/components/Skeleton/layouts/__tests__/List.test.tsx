import { render, screen } from '@testing-library/react';

import { Base } from '../__stories__/List.stories';

describe('<List />', () => {
  it('Should show list by default', () => {
    render(<Base />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
