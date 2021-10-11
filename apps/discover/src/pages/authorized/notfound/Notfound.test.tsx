import { render, screen } from '@testing-library/react';

import { NotFoundPage, MESSAGE } from './Notfound';

describe('NotFound', () => {
  render(<NotFoundPage />);

  // All tests will go here

  it("renders page'", () => {
    expect(screen.getByText(MESSAGE)).toBeInTheDocument();
  });
});
