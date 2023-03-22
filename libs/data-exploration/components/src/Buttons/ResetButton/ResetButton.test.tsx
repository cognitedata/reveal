import { fireEvent, screen, render } from '@testing-library/react';
import { ResetButton } from './ResetButton';
import { RESET } from './constants';

describe('ResetButton', () => {
  it('should render correctly', () => {
    render(<ResetButton />);

    expect(screen.getByText(RESET)).toBeInTheDocument();
  });

  it('should trigger click event', () => {
    const onClick = jest.fn();
    render(<ResetButton onClick={onClick} />);

    fireEvent.click(screen.getByText(RESET));
    expect(onClick).toHaveBeenCalled();
  });
});
