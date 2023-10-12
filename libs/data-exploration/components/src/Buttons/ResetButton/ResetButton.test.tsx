import { fireEvent, screen, render } from '@testing-library/react';

import { RESET } from './constants';
import { ResetButton } from './ResetButton';

describe('ResetButton', () => {
  it('should render correctly', () => {
    render(<ResetButton />);

    expect(screen.getByText(RESET)).toBeInTheDocument();
  });

  it('should trigger click event', () => {
    const onClick = jest.fn();
    render(<ResetButton onClick={onClick} />);

    fireEvent.click(screen.getByRole('button', { name: RESET }));
    expect(onClick).toHaveBeenCalled();
  });
});
